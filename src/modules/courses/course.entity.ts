import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EntityBase } from "../../common/entity";
import { User } from "../users";
import { CourseNode } from "./course-node.entity";
import { Coordinates, PointColumn } from "../../common/geo";

@Entity({ name: "courses" })
export class Course extends EntityBase {
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

  @Column({ name: "image_url", type: "varchar" })
  imageURL: string;

  @PointColumn()
  departure: Coordinates;

  @Column({ type: "float8" })
  length: number;

  @Column({ name: "time", type: "double precision" })
  time: number;

  @Column({ name: "n_completed", type: "int", default: 0, nullable: false })
  nCompleted: number;

  @OneToMany(() => CourseNode, (n) => n.course)
  nodes: CourseNode[];
}
