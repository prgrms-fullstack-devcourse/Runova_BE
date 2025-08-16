import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
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

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
