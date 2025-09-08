import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../users/user.entity";
import { Comment } from "./comment.entity";
import { PostLike } from "./post-like.entity";
import { EntityBase } from "../../common/entity/entity.base";

export enum PostType {
  FREE = "FREE",
  PROOF = "PROOF",
  SHARE = "SHARE",
  MATE = "MATE",
}

@Entity("posts")
export class Post extends EntityBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: "int" })
  authorId: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  author: User;

  @Index()
  @Column({ type: "enum", enum: PostType })
  type: PostType;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text" })
  content: string;

  @Column({ type: "varchar", length: 512, nullable: true })
  imageKey?: string | null;

  @Column({ type: "int", nullable: true, default: null })
  routeId: number;

  @Column({ type: "int", default: 0 }) likeCount: number;
  @Column({ type: "int", default: 0 }) commentCount: number;

  @Column({ type: "boolean", default: false }) isDeleted: boolean;

  @OneToMany(() => Comment, (c) => c.post) comments: Comment[];
  @OneToMany(() => PostLike, (l) => l.post) likes: PostLike[];
}
