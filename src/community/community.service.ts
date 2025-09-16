import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  DataSource,
  Repository,
  SelectQueryBuilder,
  ObjectLiteral,
  In,
} from "typeorm";
import { Post, PostType } from "../modules/posts/post.entity";
import { Comment } from "../modules/posts/comment.entity";
import { PostLike } from "../modules/posts/post-like.entity";
import { User } from "../modules/users/user.entity";
import { CreatePostDto, UpdatePostDto, ListPostsFilter } from "./dto/post.dto";
import { CreateCommentDto, UpdateCommentDto } from "./dto/comment.dto";
import { CursorQuery } from "./dto/cursor.dto";
import { encodeCursor, decodeCursor } from "./utils/cursor.util";
import {
  AuthorBrief,
  CommentWithAuthor,
  CommentWithoutAuthor,
  CursorResult,
  PostWithAuthor,
  PostWithoutAuthor,
} from "./types/types";

const DEFAULT_LIMIT = 20;

@Injectable()
export class CommunityService {
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

  async createPost(authorId: number, dto: CreatePostDto): Promise<Post> {
    const entity = this.postRepo.create({
      authorId,
      type: dto.type,
      title: dto.title,
      content: dto.content,
      imageUrl: dto.imageUrl ?? null,
      routeId: dto.routeId ?? null,
      likeCount: 0,
      commentCount: 0,
      isDeleted: false,
    });
    return await this.postRepo.save(entity);
  }

  private async getAuthorsMap(
    authorIds: number[]
  ): Promise<Map<number, AuthorBrief>> {
    if (authorIds.length === 0) return new Map();
    const uniq = Array.from(new Set(authorIds));
    const userRepo = this.dataSource.getRepository(User);

    const users = await userRepo.find({
      where: { id: In(uniq) },
      select: ["id", "nickname", "imageUrl"],
    });

    const map = new Map<number, AuthorBrief>();
    for (const u of users) {
      map.set(u.id, {
        id: u.id,
        nickname: u.nickname,
        imageUrl: u.imageUrl ?? null,
      });
    }
    return map;
  }

  private async attachAuthors(posts: Post[]): Promise<PostWithAuthor[]> {
    const authorIds = posts.map((p) => p.authorId);
    const authorsMap = await this.getAuthorsMap(authorIds);

    return posts.map((p): PostWithAuthor => {
      const { author: _ignored, ...rest } = p as Post & { author?: unknown };
      return {
        ...(rest as PostWithoutAuthor),
        authorInfo: authorsMap.get(p.authorId) ?? {
          id: 0,
          nickname: "탈퇴회원",
          imageUrl: null,
        },
      };
    });
  }

  private async attachAuthor(post: Post): Promise<PostWithAuthor> {
    const [wrapped] = await this.attachAuthors([post]);
    return wrapped;
  }

  private async attachAuthorsToComments(
    comments: Comment[]
  ): Promise<CommentWithAuthor[]> {
    const authorIds = comments.map((c) => c.authorId);
    const authorsMap = await this.getAuthorsMap(authorIds);

    return comments.map((c): CommentWithAuthor => {
      const { author: _ignored, ...rest } = c as Comment & { author?: unknown };
      return {
        ...(rest as CommentWithoutAuthor),
        authorInfo: authorsMap.get(c.authorId) ?? {
          id: 0,
          nickname: "탈퇴회원",
          imageUrl: null,
        },
      };
    });
  }

  private async attachAuthorToComment(
    comment: Comment
  ): Promise<CommentWithAuthor> {
    const [wrapped] = await this.attachAuthorsToComments([comment]);
    return wrapped;
  }

  async listPostsCursor(
    query: CursorQuery,
    filter: ListPostsFilter
  ): Promise<CursorResult<PostWithAuthor>> {
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
    const withAuthors = await this.attachAuthors(items);
    return { items: withAuthors, nextCursor };
  }

  async getPost(id: number): Promise<PostWithAuthor> {
    const post = await this.findActivePostOrThrow(id);
    return this.attachAuthor(post);
  }

  async updatePost(
    id: number,
    editorId: number,
    dto: UpdatePostDto
  ): Promise<Post> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post || post.isDeleted) throw new NotFoundException("Post not found");
    if (post.authorId !== editorId) {
      throw new ForbiddenException("No permission to edit this post");
    }

    if (dto.type) post.type = dto.type as PostType;
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.routeId !== undefined) post.routeId = dto.routeId;
    if (dto.imageUrl !== undefined) post.imageUrl = dto.imageUrl;

    return await this.postRepo.save(post);
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
  ): Promise<CursorResult<CommentWithAuthor>> {
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
    const withAuthors = await this.attachAuthorsToComments(items);
    return { items: withAuthors, nextCursor };
  }

  async createComment(
    postId: number,
    authorId: number,
    dto: CreateCommentDto
  ): Promise<CommentWithAuthor> {
    await this.findActivePostOrThrow(postId);

    return this.dataSource.transaction(async (trx) => {
      const commentRepo = trx.getRepository(Comment);
      const postRepo = trx.getRepository(Post);

      const saved = await commentRepo.save(
        commentRepo.create({ postId, authorId, content: dto.content })
      );
      await postRepo.increment({ id: postId }, "commentCount", 1);
      return this.attachAuthorToComment(saved);
    });
  }

  async updateComment(
    id: number,
    editorId: number,
    dto: UpdateCommentDto
  ): Promise<CommentWithAuthor> {
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException("Comment not found");
    if (comment.authorId !== editorId) {
      throw new ForbiddenException("No permission to edit this comment");
    }
    comment.content = dto.content;
    const saved = await this.commentRepo.save(comment);
    return this.attachAuthorToComment(saved);
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
