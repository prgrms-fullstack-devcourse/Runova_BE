import {
  Column,
  Entity, Index,
  JoinColumn,
  ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ImmutableEntityBase } from "../../common/entity";
import { User } from "../users";
import { CourseNode } from "./course-node.entity";
import {
  Coordinates,
  convertCoordinatesToPoint,
  convertLineStringToLocations,
  Location,
  convertLocationsToLineString,
  convertPointToCoordinates
} from "../../common/geo";
import { CRS_CODE } from "../../config/proj4";

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

  @Index()
  @Column({
    type: "geometry",
    spatialFeatureType: "Point",
    precision: 6,
    srid: CRS_CODE,
    transformer: {
      from: convertPointToCoordinates,
      to: convertCoordinatesToPoint,
    }
  })
  head: Coordinates;

  @Column({
    type: "geometry",
    spatialFeatureType: "LineString",
    precision: 6,
    srid: 4326,
    transformer: {
      from: convertLineStringToLocations,
      to: convertLocationsToLineString,
    }
  })
  path: Location[];

  @Column({ type: "float8" })
  length: number;

  @Column({ type: "double precision" })
  hours: number;

  @Column({ name: "n_completed", type: "int", default: 0, nullable: false })
  nCompleted: number;

  @OneToMany(() => CourseNode, n => n.course)
  nodes: CourseNode[];
}
