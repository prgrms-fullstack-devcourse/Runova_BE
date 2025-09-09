import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  DataSource,
  Repository,
  SelectQueryBuilder,
  ObjectLiteral,
} from "typeorm";
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

const DEFAULT_LIMIT = 20;
const URL_EXPIRES_SEC = 60 * 5;

@Injectable()
export class CommunityService {
  private readonly awsRegion = process.env.AWS_REGION?.trim();
  private readonly awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  private readonly awsSecret = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  private readonly s3Bucket = process.env.S3_BUCKET?.trim();
  private readonly cdnDomain = process.env.CLOUDFRONT_DOMAIN?.trim();

  private readonly s3 = new S3Client({
    region: this.awsRegion,
    credentials: {
      accessKeyId: this.awsAccessKeyId!,
      secretAccessKey: this.awsSecret!,
    },
  });

  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    private readonly dataSource: DataSource
  ) {}

  private async findActivePostOrThrow(postId: number): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id: postId, isDeleted: false },
    });
    if (!post) throw new NotFoundException("Post not found");
    return post;
  }

  private applyCursorWhereDesc<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    alias: string,
    cursorStr?: string | null
  ): void {
    const cursor = decodeCursor(cursorStr ?? null);
    if (!cursor) return;

    queryBuilder.andWhere(
      `(${alias}.createdAt < :cursorAt OR (${alias}.createdAt = :cursorAt AND ${alias}.id < :cursorId))`,
      { cursorAt: cursor.createdAt, cursorId: cursor.id }
    );
  }

  private sliceWithNextCursor<T extends { id: number; createdAt: Date }>(
    rows: T[],
    limit: number
  ): { items: T[]; nextCursor: string | null } {
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const last = items[items.length - 1];
    const nextCursor =
      hasMore && last ? encodeCursor(last.createdAt, last.id) : null;
    return { items, nextCursor };
  }

  private async buildImageUrlFromKey(key?: string | null): Promise<string> {
    if (!key) return "";
    if (!this.s3Bucket) throw new Error("S3_BUCKET not set");
    return `${this.cdnDomain}/${key}`;
  }

  private assertOwnPostImageKey(authorId: number, key?: string | null): void {
    if (!key) return;
    const expectedPrefix = `posts/${authorId}/`;
    if (!key.startsWith(expectedPrefix)) {
      throw new BadRequestException("Invalid imageKey prefix");
    }
  }

  async createPost(authorId: number, dto: CreatePostDto): Promise<PostWithUrl> {
    this.assertOwnPostImageKey(authorId, dto.imageKey);

    const entity = this.postRepo.create({
      authorId,
      type: dto.type,
      title: dto.title,
      content: dto.content,
      imageKey: dto.imageKey ?? null,
      routeId: dto.routeId ?? null,
      likeCount: 0,
      commentCount: 0,
      isDeleted: false,
    });

    const saved = await this.postRepo.save(entity);
    return {
      ...saved,
      imageUrl: await this.buildImageUrlFromKey(saved.imageKey),
    };
  }

  async listPostsCursor(
    query: CursorQuery,
    filter: ListPostsFilter
  ): Promise<CursorResult<PostWithUrl>> {
    const limit = query.limit ?? DEFAULT_LIMIT;

    const queryBuilder = this.postRepo
      .createQueryBuilder("p")
      .where("p.isDeleted = false");
    if (filter.type)
      queryBuilder.andWhere("p.type = :type", { type: filter.type });
    if (filter.authorId)
      queryBuilder.andWhere("p.authorId = :authorId", {
        authorId: filter.authorId,
      });
    if (filter.routeId)
      queryBuilder.andWhere("p.routeId = :routeId", {
        routeId: filter.routeId,
      });

    this.applyCursorWhereDesc(queryBuilder, "p", query.cursor);
    queryBuilder
      .orderBy("p.createdAt", "DESC")
      .addOrderBy("p.id", "DESC")
      .take(limit + 1);

    const rows: Post[] = await queryBuilder.getMany();
    const { items, nextCursor } = this.sliceWithNextCursor(rows, limit);

    const itemsWithUrl: PostWithUrl[] = await Promise.all(
      items.map(async (p) => ({
        ...p,
        imageUrl: await this.buildImageUrlFromKey(p.imageKey),
      }))
    );

    return { items: itemsWithUrl, nextCursor };
  }

  async getPost(id: number): Promise<PostWithUrl> {
    const post = await this.findActivePostOrThrow(id);
    return {
      ...post,
      imageUrl: await this.buildImageUrlFromKey(post.imageKey),
    };
  }

  async updatePost(
    id: number,
    editorId: number,
    dto: UpdatePostDto
  ): Promise<PostWithUrl> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post || post.isDeleted) throw new NotFoundException("Post not found");
    if (post.authorId !== editorId) {
      throw new ForbiddenException("No permission to edit this post");
    }

    if (dto.type) post.type = dto.type as PostType;
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.routeId !== undefined) post.routeId = dto.routeId;

    if (dto.imageKey !== undefined) {
      this.assertOwnPostImageKey(editorId, dto.imageKey);
      post.imageKey = dto.imageKey ?? null;
    }

    const saved = await this.postRepo.save(post);
    return {
      ...saved,
      imageUrl: await this.buildImageUrlFromKey(saved.imageKey),
    };
  }

  async deletePost(id: number, requesterId: number): Promise<void> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post || post.isDeleted) throw new NotFoundException("Post not found");
    if (post.authorId !== requesterId) {
      throw new ForbiddenException("No permission to delete this post");
    }

    post.isDeleted = true;
    await this.postRepo.save(post);
  }

  async togglePostLike(
    postId: number,
    userId: number
  ): Promise<{ liked: boolean; likeCount: number }> {
    await this.findActivePostOrThrow(postId);

    return this.dataSource.transaction(async (trx) => {
      const likeRepo = trx.getRepository(PostLike);
      const postRepo = trx.getRepository(Post);

      const existing = await likeRepo.findOne({ where: { postId, userId } });
      if (existing) {
        await likeRepo.remove(existing);
        await postRepo.decrement({ id: postId }, "likeCount", 1);
        const { likeCount } = await postRepo.findOneByOrFail({ id: postId });
        return { liked: false, likeCount };
      }

      await likeRepo.save(likeRepo.create({ postId, userId }));
      await postRepo.increment({ id: postId }, "likeCount", 1);
      const { likeCount } = await postRepo.findOneByOrFail({ id: postId });
      return { liked: true, likeCount };
    });
  }

  async listCommentsCursor(
    postId: number,
    query: CursorQuery
  ): Promise<CursorResult<Comment>> {
    await this.findActivePostOrThrow(postId);

    const limit = query.limit ?? DEFAULT_LIMIT;
    const queryBuilder = this.commentRepo
      .createQueryBuilder("c")
      .where("c.postId = :postId", { postId });

    const cursor = decodeCursor(query.cursor ?? null);
    if (cursor) {
      queryBuilder.andWhere(
        "(c.createdAt > :cursorAt OR (c.createdAt = :cursorAt AND c.id > :cursorId))",
        { cursorAt: cursor.createdAt, cursorId: cursor.id }
      );
    }

    queryBuilder
      .orderBy("c.createdAt", "ASC")
      .addOrderBy("c.id", "ASC")
      .take(limit + 1);

    const rows: Comment[] = await queryBuilder.getMany();
    const { items, nextCursor } = this.sliceWithNextCursor(rows, limit);
    return { items, nextCursor };
  }

  async createComment(
    postId: number,
    authorId: number,
    dto: CreateCommentDto
  ): Promise<Comment> {
    await this.findActivePostOrThrow(postId);

    return this.dataSource.transaction(async (trx) => {
      const commentRepo = trx.getRepository(Comment);
      const postRepo = trx.getRepository(Post);

      const saved = await commentRepo.save(
        commentRepo.create({ postId, authorId, content: dto.content })
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
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException("Comment not found");
    if (comment.authorId !== editorId) {
      throw new ForbiddenException("No permission to edit this comment");
    }
    comment.content = dto.content;
    return this.commentRepo.save(comment);
  }

  async deleteComment(id: number, requesterId: number): Promise<void> {
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException("Comment not found");
    if (comment.authorId !== requesterId) {
      throw new ForbiddenException("No permission to delete this comment");
    }

    await this.dataSource.transaction(async (trx) => {
      const commentRepo = trx.getRepository(Comment);
      const postRepo = trx.getRepository(Post);
      await commentRepo.delete({ id: comment.id });
      await postRepo.decrement({ id: comment.postId }, "commentCount", 1);
    });
  }
}
