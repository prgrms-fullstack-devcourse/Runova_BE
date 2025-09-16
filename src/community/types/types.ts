import { Comment } from "src/modules/posts/comment.entity";
import { Post } from "src/modules/posts/post.entity";

export type CursorResult<T> = { items: T[]; nextCursor: string | null };

export type AuthorBrief = {
  id: number;
  nickname: string;
  imageUrl: string | null;
};

export type PostWithoutAuthor = Omit<Post, "author">;
export type PostWithAuthor = PostWithoutAuthor & { authorInfo: AuthorBrief };

export type CommentWithoutAuthor = Omit<Comment, "author">;
export type CommentWithAuthor = CommentWithoutAuthor & {
  authorInfo: AuthorBrief;
};
