import { ImmutableEntityBase } from "../../common/entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PointColumn } from "../../common/geo";
import { Course } from "./course.entity";

@Entity("course_nodes")
export class CourseNode extends ImmutableEntityBase {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ name: "course_id", type: "int" })
    courseId: number;

    @ManyToOne(() => Course, { onDelete: "CASCADE" })
    @JoinColumn({ name: "course_id" })
    course: Course;

    @PointColumn()
    location: [number, number];

    @Column({ type: "float8" })
    progress: number;

    @Column({ type: "float8" })
    bearing: number;
}