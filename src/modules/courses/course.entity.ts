import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EntityBase } from "../../common/entity";
import { User } from "../users";
import { Line, LineStringColumn, PointColumn, Position } from "../../common/geometry";

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

  @Column({ type: "boolean" })
  shared: boolean;

  @Column({ type: "varchar" })
  title: string;

  @Column({ name: "image_url", type: "varchar" })
  imageURL: string;


  @LineStringColumn()
  path: Line;


  @PointColumn()
  departure: Position;

  @Column({ type: "float8" })
  length: number;
}
