import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "../posts/post.entity";
import { Comment } from "../posts/comment.entity";
import { PostLike } from "../posts/post-like.entity";
import { Course } from "../courses/course.entity";
import { CompletedCourse } from "../courses/completed-course.entity";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: "varchar", nullable: false })
  email: string;

  @Index({ unique: true })
  @Column({ type: "varchar", nullable: false })
  nickname: string;

  @OneToMany(() => Course, (c) => c.user)
  courses: Course[];

  @OneToMany(() => CompletedCourse, (cc) => cc.user)
  completedCourses: CompletedCourse[];

  @Column({ nullable: true })
  avatarUrl?: string;

  @OneToMany(() => Post, (p) => p.author) posts: Post[];
  @OneToMany(() => Comment, (c) => c.author) comments: Comment[];
  @OneToMany(() => PostLike, (l) => l.user) likes: PostLike[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
