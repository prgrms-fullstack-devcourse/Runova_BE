import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./post.entity";
import { User } from "../users/user.entity";

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Index() @Column({ type: "int" }) postId: number;
  @ManyToOne(() => Post, (p) => p.comments, { onDelete: "CASCADE" }) post: Post;

  @Index() @Column({ type: "int" }) authorId: number;
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  author: User;

  @Column({ type: "text" }) content: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
