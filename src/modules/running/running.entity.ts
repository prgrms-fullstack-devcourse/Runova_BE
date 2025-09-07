import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ImmutableEntityBase } from "../../common/entity";
import { User } from "../users";
import { Course } from "../courses";

@Entity("runnings")
export class Running extends ImmutableEntityBase {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ name: "user_id", type: "int" })
    userId: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;

    @Index()
    @Column({ name: "course_id", type: "int" })
    courseId: number;

    @OneToOne(() => Course, { cascade: ["insert"] })
    @JoinColumn({ name: "course_id" })
    course: Course;

    @Column({ name: "start_at", type: "timestamptz" })
    startAt: Date;

    @Column({ name: "end_at", type: "timestamptz" })
    endAt: Date;

    @Column({ type: "float8" })
    distance: number;

    @Column({ type: "float8" })
    pace: number;

    @Column({ type: "float8" })
    calories: number;
}