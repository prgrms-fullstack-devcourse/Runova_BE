import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ImmutableEntityBase } from "../../common/entity";
import { User } from "../users";
import { Course } from "./course.entity";

@Entity("course_bookmarks")
@Unique(["courseId", "userId"])
export class CourseBookmark extends ImmutableEntityBase {
    @PrimaryGeneratedColumn()
    id: number;

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