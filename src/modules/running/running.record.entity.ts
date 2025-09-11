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
import { LineStringColumn } from "../../common/geo";
import { Course } from "../courses";

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
  path: [number, number][];

  @Column({ name: "art_url", type: "varchar" })
  artUrl: string;

  @Column({ name: "image_url", type: "varchar" })
  imageUrl: string;

  @Column({ name: "start_at", type: "timestamptz" })
  startAt: Date;

  @Column({ name: "end_at", type: "timestamptz" })
  endAt: Date;

  @Column({
    type: "float8",
    generatedType: "STORED",
    asExpression: `ST_Length(ST_Transform(running_records.path, 5179))`
  })
  distance: number;

  @Column({
    type: "float8",
    generatedType: "STORED",
    asExpression: `EXTRACT(EPOCH FROM (running_records.end_at - running_records.start_at))`
  })
  duration: number;

  @Column({ type: "float8" })
  pace: number;

  @Column({ type: "float8" })
  calories: number;
}
