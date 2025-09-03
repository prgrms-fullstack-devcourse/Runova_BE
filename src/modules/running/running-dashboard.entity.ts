import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { EntityBase } from "../../common/entity";
import { User } from "../users";

@Entity("running_dashboards")
export class RunningDashboard extends EntityBase {
    @PrimaryColumn({ name: "user_id", type: "int" })
    userId: number;

    @OneToOne(() => User, user => user.cart, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: "n_records", type: "int" })
    nRecords: number;

    @Column({ name: "mean_pace", type: "float8" })
    meanPace: number;

    @Column({ name: "total_distance", type: "float8" })
    totalDistance: number;

    @Column({ name: "total_duration", type: "double precision" })
    totalDuration: number;

    @Column({ name: "total_calories", type: "float8" })
    totalCalories: number;
}