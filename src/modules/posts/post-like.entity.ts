import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Post } from "./post.entity";
import { User } from "../users/user.entity";
import { EntityBase } from "../../common/entity/entity.base";

@Entity("post_likes")
@Unique(["postId", "userId"])
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Index() @Column({ type: "int" }) postId: number;
  @ManyToOne(() => Post, (p) => p.likes, { onDelete: "CASCADE" }) post: Post;

  @Index() @Column({ type: "int" }) userId: number;
  @ManyToOne(() => User, { onDelete: "CASCADE" }) user: User;

  createdAt: EntityBase;
}
