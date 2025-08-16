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

/**
 * ERD: completed_courses
 * - user_id int NOT NULL (FK)
 * - course_id int NOT NULL (FK)
 * - taked_time double NOT NULL  (ERD 표기 그대로 사용)
 *
 * 주의: 동일 user가 같은 course를 여러 번 완료할 수 있게
 * (user_id, course_id) Unique는 두지 않았음. 필요하면 Unique 추가.
 */
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

  // ERD의 taked_time → DB 컬럼명 유지, 코드 프로퍼티는 camelCase 사용
  @Column({ name: "taked_time", type: "double precision", nullable: false })
  takedTime: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
