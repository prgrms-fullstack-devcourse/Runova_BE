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

/**
 * ERD: courses
 * - user_id int NOT NULL (FK → users.id)
 * - length double NOT NULL
 * - path geometry(Polygon,4326) NOT NULL
 * - n_completed int NOT NULL default 0
 */
@Entity({ name: "courses" })
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: "user_id", type: "int", nullable: false })
  userId: number;

  @ManyToOne(() => User, (u) => u.courses, { onDelete: "CASCADE" })
  user: User;

  // 총 길이(m 단위 등). ERD의 double → PostgreSQL: double precision
  @Column({ type: "double precision", nullable: false })
  length: number;

  // PostGIS geometry(Polygon, 4326)
  // TypeORM(PostgreSQL): type='geometry', spatialFeatureType='Polygon', srid=4326
  @Column({
    type: "geometry",
    spatialFeatureType: "Polygon",
    srid: 4326,
    nullable: false,
  })
  path: any; // GeoJSON-like 객체를 직접 저장하지 않음. 쿼리 시 WKT/WKB 사용 또는 커스텀 변환.

  @Column({ name: "n_completed", type: "int", default: 0, nullable: false })
  nCompleted: number;

  @OneToMany(() => CompletedCourse, (cc) => cc.course)
  completedCourses: CompletedCourse[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
