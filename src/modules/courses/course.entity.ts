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
import { CourseNode } from "./course.node.entity";
import { PointColumn, PolygonColumn } from "../../common/geo";

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
  imageUrl: string;

  @Column({ type: "float8" })
  length: number;

  @PointColumn()
  departure: [number, number];

  @PolygonColumn()
  shape: [number, number][][];

  @OneToMany(() => CourseNode, (n) => n.course)
  nodes: CourseNode[];
}
