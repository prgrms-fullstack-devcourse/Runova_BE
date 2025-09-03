import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("running_statistics_mv")
export class RunningStatisticsView {
    @PrimaryColumn({ name: "user_id", type: "int" })
    userId: number;

    @Column({ name: "total_distance", type: "float8" })
    totalDistance: number;

    @Column({ name: "total_duration", type: "double precision" })
    totalDuration: number;

    @Column({ name: "mean_pace", type: "float8" })
    meanPace: number;

    @Column({ name: "total_calories", type: "float8" })
    totalCalories: number;
}