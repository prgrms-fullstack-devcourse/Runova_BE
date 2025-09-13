import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Post } from "./post.entity";
import { User } from "../users";
import { EntityBase } from "../../common/entity";

@Entity("comments")
export class Comment extends EntityBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Index() @Column({ type: "int" }) postId: number;
  @ManyToOne(() => Post, (p) => p.comments, { onDelete: "CASCADE" }) post: Post;

  @Index() @Column({ type: "int" }) authorId: number;
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  author: User;

  @Column({ type: "text" }) content: string;
}
