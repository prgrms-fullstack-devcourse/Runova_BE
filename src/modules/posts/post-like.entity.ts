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
import { ImmutableEntityBase } from "../../common/entity/immutable.entity.base";

@Entity("post_likes")
@Unique(["postId", "userId"])
export class PostLike extends ImmutableEntityBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Index() @Column({ type: "int" }) postId: number;
  @ManyToOne(() => Post, (p) => p.likes, { onDelete: "CASCADE" }) post: Post;

  @Index() @Column({ type: "int" }) userId: number;
  @ManyToOne(() => User, { onDelete: "CASCADE" }) user: User;
}
