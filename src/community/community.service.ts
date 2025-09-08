import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Post, PostType } from "../modules/posts/post.entity";
import { Comment } from "../modules/posts/comment.entity";
import { PostLike } from "../modules/posts/post-like.entity";
import { CreatePostDto, UpdatePostDto, ListPostsFilter } from "./dto/post.dto";
import { CreateCommentDto, UpdateCommentDto } from "./dto/comment.dto";
import { CursorQuery } from "./dto/cursor.dto";
import { encodeCursor, decodeCursor } from "./utils/cursor.util";

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type CursorResult<T> = { items: T[]; nextCursor: string | null };
type PostWithUrl = Post & { imageUrl: string };

@Injectable()
export class CommunityService {
  private readonly s3 = new S3Client({
    region: process.env.AWS_REGION?.trim(),
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim()!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim()!,
    },
  });

  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(PostLike) private readonly likeRepo: Repository<PostLike>,
    private readonly dataSource: DataSource
  ) {}

  // ---------- 내부 유틸 ----------

  private async buildImageUrlFromKey(key?: string | null): Promise<string> {
    if (!key) return "";
    const cdn = process.env.CLOUDFRONT_DOMAIN?.trim();
    if (cdn) return `${cdn}/${key}`;
    const bucket = process.env.S3_BUCKET?.trim();
    if (!bucket) throw new Error("S3_BUCKET not set");
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    return await getSignedUrl(this.s3, cmd, { expiresIn: 60 * 5 });
  }

  private assertOwnPostImageKey(authorId: number, key?: string | null) {
    if (!key) return;
    const expectedPrefix = `posts/${authorId}/`;
    if (!key.startsWith(expectedPrefix)) {
      throw new BadRequestException("Invalid imageKey prefix");
    }
  }

  // ---------- 게시글 ----------

  async createPost(authorId: number, dto: CreatePostDto): Promise<PostWithUrl> {
    this.assertOwnPostImageKey(authorId, dto.imageKey);

    const post = this.postRepo.create({
      authorId,
      type: dto.type,
      title: dto.title,
      content: dto.content,
      imageKey: dto.imageKey ?? null, // 단일 이미지
      routeId: dto.routeId ?? null,
      likeCount: 0,
      commentCount: 0,
      isDeleted: false,
    });

    const saved = await this.postRepo.save(post);
    const imageUrl = await this.buildImageUrlFromKey(saved.imageKey);
    return { ...saved, imageUrl };
  }

  async listPostsCursor(
    q: CursorQuery,
    f: ListPostsFilter
  ): Promise<CursorResult<PostWithUrl>> {
    const limit = q.limit ?? 20;
    const cursor = decodeCursor(q.cursor);

    const qb = this.postRepo
      .createQueryBuilder("p")
      .where("p.isDeleted = false");

    if (f.type) qb.andWhere("p.type = :type", { type: f.type });
    if (f.authorId)
      qb.andWhere("p.authorId = :authorId", { authorId: f.authorId });
    if (f.routeId) qb.andWhere("p.routeId = :routeId", { routeId: f.routeId });

    if (cursor) {
      qb.andWhere(
        "(p.createdAt < :cAt OR (p.createdAt = :cAt AND p.id < :cId))",
        {
          cAt: cursor.createdAt,
          cId: cursor.id,
        }
      );
    }

    qb.orderBy("p.createdAt", "DESC")
      .addOrderBy("p.id", "DESC")
      .take(limit + 1);

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const sliced = hasMore ? rows.slice(0, limit) : rows;

    const items: PostWithUrl[] = await Promise.all(
      sliced.map(async (p) => ({
        ...p,
        imageUrl: await this.buildImageUrlFromKey(p.imageKey),
      }))
    );

    const nextCursor = hasMore
      ? encodeCursor(
          sliced[sliced.length - 1].createdAt,
          sliced[sliced.length - 1].id
        )
      : null;

    return { items, nextCursor };
  }

  async getPost(id: number): Promise<PostWithUrl> {
    const post = await this.postRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!post) throw new NotFoundException("Post not found");
    const imageUrl = await this.buildImageUrlFromKey(post.imageKey);
    return { ...post, imageUrl };
  }

  async updatePost(
    id: number,
    editorId: number,
    dto: UpdatePostDto
  ): Promise<PostWithUrl> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post || post.isDeleted) throw new NotFoundException("Post not found");
    if (post.authorId !== editorId)
      throw new ForbiddenException("No permission to edit this post");

    if (dto.type) post.type = dto.type as PostType;
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.routeId !== undefined) post.routeId = dto.routeId;

    if (dto.imageKey !== undefined) {
      this.assertOwnPostImageKey(editorId, dto.imageKey);
      post.imageKey = dto.imageKey ?? null;
    }

    const saved = await this.postRepo.save(post);
    const imageUrl = await this.buildImageUrlFromKey(saved.imageKey);
    return { ...saved, imageUrl };
  }

  async deletePost(id: number, requesterId: number): Promise<void> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post || post.isDeleted) throw new NotFoundException("Post not found");
    if (post.authorId !== requesterId)
      throw new ForbiddenException("No permission to delete this post");

    post.isDeleted = true;
    await this.postRepo.save(post);
  }

  async togglePostLike(
    postId: number,
    userId: number
  ): Promise<{ liked: boolean; likeCount: number }> {
    const post = await this.postRepo.findOne({
      where: { id: postId, isDeleted: false },
    });
    if (!post) throw new NotFoundException("Post not found");

    return this.dataSource.transaction(async (m) => {
      const likeRepo = m.getRepository(PostLike);
      const postRepo = m.getRepository(Post);

      const prev = await likeRepo.findOne({ where: { postId, userId } });
      if (prev) {
        await likeRepo.remove(prev);
        await postRepo.decrement({ id: postId }, "likeCount", 1);
        const { likeCount } = await postRepo.findOneByOrFail({ id: postId });
        return { liked: false, likeCount };
      } else {
        await likeRepo.save(likeRepo.create({ postId, userId }));
        await postRepo.increment({ id: postId }, "likeCount", 1);
        const { likeCount } = await postRepo.findOneByOrFail({ id: postId });
        return { liked: true, likeCount };
      }
    });
  }

  // ---------- 댓글 ----------

  async listCommentsCursor(
    postId: number,
    q: CursorQuery
  ): Promise<CursorResult<Comment>> {
    const post = await this.postRepo.findOne({
      where: { id: postId, isDeleted: false },
    });
    if (!post) throw new NotFoundException("Post not found");

    const limit = q.limit ?? 20;
    const cursor = decodeCursor(q.cursor);

    const qb = this.commentRepo
      .createQueryBuilder("c")
      .where("c.postId = :postId", { postId });

    if (cursor) {
      qb.andWhere(
        "(c.createdAt > :cAt OR (c.createdAt = :cAt AND c.id > :cId))",
        {
          cAt: cursor.createdAt,
          cId: cursor.id,
        }
      );
    }

    qb.orderBy("c.createdAt", "ASC")
      .addOrderBy("c.id", "ASC")
      .take(limit + 1);

    const items = await qb.getMany();
    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;

    const nextCursor = hasMore
      ? encodeCursor(
          sliced[sliced.length - 1].createdAt,
          sliced[sliced.length - 1].id
        )
      : null;

    return { items: sliced, nextCursor };
  }

  async createComment(
    postId: number,
    authorId: number,
    dto: CreateCommentDto
  ): Promise<Comment> {
    const post = await this.postRepo.findOne({
      where: { id: postId, isDeleted: false },
    });
    if (!post) throw new NotFoundException("Post not found");

    return this.dataSource.transaction(async (m) => {
      const commentRepo = m.getRepository(Comment);
      const postRepo = m.getRepository(Post);

      const saved = await commentRepo.save(
        commentRepo.create({
          postId,
          authorId,
          content: dto.content,
        })
      );
      await postRepo.increment({ id: postId }, "commentCount", 1);
      return saved;
    });
  }

  async updateComment(
    id: number,
    editorId: number,
    dto: UpdateCommentDto
  ): Promise<Comment> {
    const c = await this.commentRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException("Comment not found");
    if (c.authorId !== editorId)
      throw new ForbiddenException("No permission to edit this comment");

    c.content = dto.content;
    return this.commentRepo.save(c);
  }

  async deleteComment(id: number, requesterId: number): Promise<void> {
    const c = await this.commentRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException("Comment not found");
    if (c.authorId !== requesterId)
      throw new ForbiddenException("No permission to delete this comment");

    await this.dataSource.transaction(async (m) => {
      const commentRepo = m.getRepository(Comment);
      const postRepo = m.getRepository(Post);
      await commentRepo.delete({ id: c.id });
      await postRepo.decrement({ id: c.postId }, "commentCount", 1);
    });
  }
}
