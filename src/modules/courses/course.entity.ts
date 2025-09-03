import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ImmutableEntityBase } from "../../common/entity";
import { User } from "../users";
import { CourseNode } from "./course-node.entity";
import { Coordinates, PointColumn } from "../../common/geo";

@Entity({ name: "courses" })
export class Course extends ImmutableEntityBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: "user_id", type: "integer" })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "varchar" })
  title: string;

  @PointColumn()
  departure: Coordinates;

  @Column({ type: "float8" })
  length: number;

  @OneToMany(() => CourseNode, (n) => n.course)
  nodes: CourseNode[];
}
