import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Post, PostType } from "../modules/posts/post.entity";
import { Comment } from "../modules/posts/comment.entity";
import { PostLike } from "../modules/posts/post-like.entity";
import { CreatePostDto, UpdatePostDto, ListPostsFilter } from "./dto/post.dto";
import { CreateCommentDto, UpdateCommentDto } from "./dto/comment.dto";
import { CursorQuery } from "./dto/cursor.dto";
import { encodeCursor, decodeCursor } from "./utils/cursor.util";
import { BusinessException } from "../common/exceptions/business.exception";
import { ErrorCode } from "../common/constants/error-code";

type CursorResult<T> = { items: T[]; nextCursor: string | null };

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(PostLike) private readonly likeRepo: Repository<PostLike>,
    private readonly dataSource: DataSource
  ) {}

  // -------- Posts --------
  async createPost(authorId: number, dto: CreatePostDto): Promise<Post> {
    const post = this.postRepo.create({
      authorId,
      type: dto.type,
      content: dto.content,
      imageUrls: dto.imageUrls ?? [],
      routeId: dto.routeId ?? null,
      likeCount: 0,
      commentCount: 0,
      isDeleted: false,
    });
    return this.postRepo.save(post);
  }

  async listPostsCursor(
    q: CursorQuery,
    f: ListPostsFilter
  ): Promise<CursorResult<Post>> {
    const limit = q.limit ?? 20;
    const cursor = decodeCursor(q.cursor);

    const qb = this.postRepo
      .createQueryBuilder("p")
      .where("p.isDeleted = false");

    if (f.type) qb.andWhere("p.type = :type", { type: f.type });
    if (f.authorId)
      qb.andWhere("p.authorId = :authorId", { authorId: f.authorId });
    if (f.routeId) qb.andWhere("p.routeId = :routeId", { routeId: f.routeId });

    // recent: createdAt DESC, id DESC
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

  async getPost(id: number): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!post) throw new BusinessException(ErrorCode.Community.POST_NOT_FOUND);
    return post;
  }

  async updatePost(
    id: number,
    editorId: number,
    dto: UpdatePostDto
  ): Promise<Post> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post || post.isDeleted)
      throw new BusinessException(ErrorCode.Community.POST_NOT_FOUND);
    if (post.authorId !== editorId)
      throw new BusinessException(ErrorCode.Common.FORBIDDEN);

    if (dto.type) post.type = dto.type as PostType;
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.imageUrls !== undefined) post.imageUrls = dto.imageUrls;
    if (dto.routeId !== undefined) post.routeId = dto.routeId;

    return this.postRepo.save(post);
  }

  async deletePost(id: number, requesterId: number): Promise<void> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post || post.isDeleted)
      throw new BusinessException(ErrorCode.Community.POST_NOT_FOUND);
    if (post.authorId !== requesterId)
      throw new BusinessException(ErrorCode.Common.FORBIDDEN);

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
    if (!post) throw new BusinessException(ErrorCode.Community.POST_NOT_FOUND);

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

  // -------- Comments (ASC 커서) --------
  async listCommentsCursor(
    postId: number,
    q: CursorQuery
  ): Promise<CursorResult<Comment>> {
    const post = await this.postRepo.findOne({
      where: { id: postId, isDeleted: false },
    });
    if (!post) throw new BusinessException(ErrorCode.Community.POST_NOT_FOUND);

    const limit = q.limit ?? 20;
    const cursor = decodeCursor(q.cursor);

    const qb = this.commentRepo
      .createQueryBuilder("c")
      .where("c.postId = :postId", { postId });

    // ASC: createdAt > cursor OR (== and id >)
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
    if (!post) throw new BusinessException(ErrorCode.Community.POST_NOT_FOUND);

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
    if (!c) throw new BusinessException(ErrorCode.Community.COMMENT_NOT_FOUND);
    if (c.authorId !== editorId)
      throw new BusinessException(ErrorCode.Common.FORBIDDEN);
    c.content = dto.content;
    return this.commentRepo.save(c);
  }

  async deleteComment(id: number, requesterId: number): Promise<void> {
    const c = await this.commentRepo.findOne({ where: { id } });
    if (!c) throw new BusinessException(ErrorCode.Community.COMMENT_NOT_FOUND);
    if (c.authorId !== requesterId)
      throw new BusinessException(ErrorCode.Common.FORBIDDEN);

    await this.dataSource.transaction(async (m) => {
      const commentRepo = m.getRepository(Comment);
      const postRepo = m.getRepository(Post);
      await commentRepo.delete({ id: c.id });
      await postRepo.decrement({ id: c.postId }, "commentCount", 1);
    });
  }
}
