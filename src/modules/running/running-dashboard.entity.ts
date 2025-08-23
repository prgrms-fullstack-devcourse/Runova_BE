import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { EntityBase } from "../../common/entity";

@Entity("running_dashboards")
export class RunningDashboard extends EntityBase {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "total_distance", type: "float8" })
    totalDistance: number;

    @Column({ name: "total_time", type: "double precision"  })
    totalTime: number;
}