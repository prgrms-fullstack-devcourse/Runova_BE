import { ImmutableEntityBase } from "../../common/entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../users";
import { Course } from "../courses";
import { Coordinates, LineStringColumn } from "../../common/geo";

@Entity("running_records")
export class RunningRecord extends ImmutableEntityBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: "user_id", type: "int" })
  userId: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Index()
  @Column({ name: "course_id", type: "int", nullable: true })
  courseId: number | null;

  @ManyToOne(() => Course, { onDelete: "SET NULL" })
  @JoinColumn({ name: "course_id" })
  course: Course | null;

  @LineStringColumn()
  path: Coordinates[];

  @Column({ name: "start_at", type: "timestamptz" })
  startAt: Date;

  @Column({ name: "end_at", type: "timestamptz" })
  endAt: Date;

  @Column({ type: "float8" })
  distance: number;

  @Column({ type: "float8" })
  pace: number;

  @Column({ type: "float8" })
  calories: number;
}
