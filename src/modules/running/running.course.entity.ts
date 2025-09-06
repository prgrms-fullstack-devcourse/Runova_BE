import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ImmutableEntityBase } from "../../common/entity";
import { Course } from "../courses";
import { User } from "../users";
import { RunningRecord } from "./index";

@Entity("running_courses")
@Unique(["recordId","courseId" ])
@Index(["courseId", "userId"])
export class RunningCourse extends ImmutableEntityBase {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ name: "record_id", type: "int" })
    recordId: number;

    @ManyToOne(() => RunningRecord, { onDelete: "CASCADE" })
    record: RunningRecord;

    @Index()
    @Column({ name: "course_id", type: "int" })
    courseId: number;

    @ManyToOne(() => Course, { onDelete: "CASCADE" })
    @JoinColumn({ name: "course_id" })
    course: Course;

    @Index()
    @Column({ name: "user_id", type: "int" })
    userId: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;
}