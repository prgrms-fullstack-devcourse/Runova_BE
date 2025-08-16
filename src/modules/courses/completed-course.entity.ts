import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../users/user.entity";
import { Course } from "./course.entity";

@Entity({ name: "completed_courses" })
export class CompletedCourse {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: "user_id", type: "int", nullable: false })
  userId: number;

  @ManyToOne(() => User, (u) => u.completedCourses, { onDelete: "CASCADE" })
  user: User;

  @Index()
  @Column({ name: "course_id", type: "int", nullable: false })
  courseId: number;

  @ManyToOne(() => Course, (c) => c.completedCourses, { onDelete: "CASCADE" })
  course: Course;

  // ERD 명칭 유지(taked_time). 코드에서는 camelCase 사용.
  @Column({ name: "taked_time", type: "double precision", nullable: false })
  takedTime: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
