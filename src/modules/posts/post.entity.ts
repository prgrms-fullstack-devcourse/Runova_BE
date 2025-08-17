import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../users/user.entity";
import { Comment } from "./comment.entity";
import { PostLike } from "./post-like.entity";

export enum PostType {
  FREE = "FREE",
  PROOF = "PROOF",
  SHARE = "SHARE",
}

@Entity("posts")
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  authorId: number;

  @ManyToOne(() => User, (u) => u.posts, { onDelete: "CASCADE" })
  author: User;

  @Index()
  @Column({ type: "enum", enum: PostType })
  type: PostType;

  @Column({ type: "text" })
  content: string;

  // 문자열 배열(이미지 URL)
  @Column({ type: "text", array: true, default: "{}" })
  imageUrls: string[];

  @Column({ type: "int", nullable: true })
  routeId?: number;

  @Column({ default: 0 }) likeCount: number;
  @Column({ default: 0 }) commentCount: number;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  @Column({ default: false }) isDeleted: boolean;

  @OneToMany(() => Comment, (c) => c.post) comments: Comment[];
  @OneToMany(() => PostLike, (l) => l.post) likes: PostLike[];
}
