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
import { LineStringColumn, PointColumn } from "../../common/geo";

@Entity({ name: "courses" })
export class Course extends EntityBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: "user_id", type: "int" })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "source_id", type: "int" })
  sourceId: number;

  @Column({ name: "is_drawn", type: "boolean" })
  isDrawn: boolean;

  @Column({ name: "image_url", type: "varchar" })
  imageUrl: string;

  @LineStringColumn()
  path: [number, number][];

  @Index({ spatial: true })
  @PointColumn()
  departure: [number, number];

  @Column({ type: "float8" })
  length: number;
}
