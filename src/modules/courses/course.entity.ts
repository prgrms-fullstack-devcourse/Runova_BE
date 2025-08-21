import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ImmutableEntityBase } from "../../common/entity";
import { User } from "../users";
import { CourseNode } from "./course-node.entity";

@Entity({ name: "courses" })
export class Course extends ImmutableEntityBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "user_id", type: "integer" })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "float8"  })
  length: number;

  @Column({ name: "time", type: "long" })
  time: number;

  @Column({ name: "n_completed", type: "int", default: 0, nullable: false })
  nCompleted: number;

  @OneToMany(() => CourseNode, n => n.course)
  nodes: CourseNode[];
}
