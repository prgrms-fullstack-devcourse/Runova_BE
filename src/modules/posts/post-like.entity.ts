import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Post } from "./post.entity";
import { User } from "../users/user.entity";

@Entity("post_likes")
@Unique(["postId", "userId"])
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Index() @Column() postId: number;
  @ManyToOne(() => Post, (p) => p.likes, { onDelete: "CASCADE" }) post: Post;

  @Index() @Column() userId: number;
  @ManyToOne(() => User, { onDelete: "CASCADE" }) user: User;

  @CreateDateColumn() createdAt: Date;
}
