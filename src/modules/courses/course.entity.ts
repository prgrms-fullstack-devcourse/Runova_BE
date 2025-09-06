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
import { Coordinates, LineStringColumn, PointColumn, PolygonColumn } from "../../common/geometry";
import { Polygon } from "geojson";

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

  @LineStringColumn()
  path: Coordinates[];

  @PointColumn()
  departure: Coordinates;

  @Column({ type: "float8" })
  length: number;

  @PolygonColumn()
  shape: Polygon;

  @OneToMany(() => CourseNode, (n) => n.course)
  nodes: CourseNode[];
}
