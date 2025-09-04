import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RunningRecord } from "../../../modules/running";
import { Repository, SelectQueryBuilder } from "typeorm";
import { RunningStatisticsDTO, RunningRecordFilters, RunningDashboardDTO, RunningStatisticsSchema } from "../../records/dto";
import { setFilters } from "./service.internal";
import { plainToInstanceOrReject } from "../../../utils";

@Injectable()
export class RunningStatisticsService {

    constructor(
       @InjectRepository(RunningRecord)
       private readonly recordsRepo: Repository<RunningRecord>
    ) {}

    async getRunningStatistics<
        K extends keyof RunningDashboardDTO
    >(
        userId: number,
        props: K[],
        filters?: RunningRecordFilters
    ): Promise<RunningStatisticsDTO<K>> {

        const qb = this.createSelectQueryBuilder(new Set<K>(props))
            .where("record.userId = :userId", { userId });

        filters && setFilters(qb, filters);
        qb.groupBy("userId");

        const raw = await qb.getRawOne();
        return plainToInstanceOrReject(RunningStatisticsSchema(props), raw);
    }

    private createSelectQueryBuilder<
        K extends keyof RunningDashboardDTO
    >(props: Set<K>): SelectQueryBuilder<RunningRecord> {

        const qb = this.recordsRepo
            .createQueryBuilder("record")
            .select(`COUNT(record)`, "nRecords");

        if (props.has("totalDistance" as K))
            qb.addSelect(`SUM(record.distance)`, "totalDistance");

        if (props.has("totalDuration" as K)) {
            qb.addSelect(
                `SUM(EXTRACT(EPOCH FROM record.endAt) - EXTRACT(EPOCH FROM record.startAt))`,
                "totalDuration"
            );
        }

        if (props.has("totalCalories" as K))
            qb.addSelect(`SUM(record.calories)`, "totalCalories");

        if (props.has("meanPace" as K))
            qb.addSelect(`AVG(record.pace)`, "meanPace");

        return qb;
    }

}