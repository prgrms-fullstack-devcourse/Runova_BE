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
import { CompletedCourse } from "./completed-course.entity";

@Entity({ name: "courses" })
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: "user_id", type: "int", nullable: false })
  userId: number;

  @ManyToOne(() => User, (u) => u.courses, { onDelete: "CASCADE" })
  user: User;

  // 총 길이 (단위는 m 등으로 API 스펙에서 고정 권장)
  @Column({ type: "double precision", nullable: false })
  length: number;

  // geometry(Polygon, 4326) — PostGIS 필요
  @Column({
    type: "geometry",
    spatialFeatureType: "Polygon",
    srid: 4326,
    nullable: false,
  })
  path: any;

  @Column({ name: "n_completed", type: "int", default: 0, nullable: false })
  nCompleted: number;

  @OneToMany(() => CompletedCourse, (cc) => cc.course)
  completedCourses: CompletedCourse[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
