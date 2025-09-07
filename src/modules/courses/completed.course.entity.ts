import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ImmutableEntityBase } from "../../common/entity";
@Entity("completed_courses")
@Unique(["courseId", "userId"])
export class CompletedCourse extends ImmutableEntityBase {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ name: "course_id", type: "int" })
    courseId: number;

    @Index()
    @Column({ name: "user_id", type: "int" })
    userId: number;
}