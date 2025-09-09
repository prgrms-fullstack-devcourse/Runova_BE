import { Injectable, Logger } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { RunningRecord } from "../../modules/running";
import { DataSource, Repository, SelectQueryBuilder } from "typeorm";
import {
    RunningStatisticsDTO,
    RunningStatisticsSchema,
    GetRunningStatisticsOptions,
    RunningAggregationFields
} from "../dto";
import { plainToInstanceOrReject } from "../../utils";

@Injectable()
export class RunningStatisticsService {

    constructor(
        @InjectDataSource()
        private readonly ds: DataSource,
        @InjectRepository(RunningRecord)
        private readonly recordsRepo: Repository<RunningRecord>,
    ) {
    }

    async getRunningStatistics<
        K extends RunningAggregationFields
    >(
        userId: number,
        props: K[],
        options?: GetRunningStatisticsOptions,
    ): Promise<RunningStatisticsDTO<K>> {

        const qb = this.createSelectQueryBuilder(new Set<K>(props))
            .where("record.userId = :userId", { userId })
            .groupBy("record.userId");

        if (options?.period) {
           const { since, until } = options.period;
           (since || until) && qb.addGroupBy("record.createdAt");
           since && qb.andWhere(`record.createdAt >= :since`, { since });
           until && qb.andWhere(`record.createdAt <= :until`, { until });
        }

        const raw = await qb.take(options?.limit).getRawOne();
        Logger.debug(raw, RunningStatisticsService.name);
        return plainToInstanceOrReject(RunningStatisticsSchema, raw);
    }

    private createSelectQueryBuilder<
        K extends RunningAggregationFields
    >(props: Set<K>): SelectQueryBuilder<RunningRecord> {

        const qb = this.ds
            .createQueryBuilder()
            .select(`COUNT(record)`, "nRecords");

        if (props.has("totalDistance" as K))
            qb.addSelect(`SUM(record.distance)`, "totalDistance");

        if (props.has("totalDuration" as K)) {
            qb.addSelect(
                `SUM(record.duration)`,
                "totalDuration"
            );
        }

        if (props.has("totalCalories" as K))
            qb.addSelect(`SUM(record.calories)`, "totalCalories");

        if (props.has("meanPace" as K))
            qb.addSelect(`AVG(record.pace)`, "meanPace");

        return qb.from(
            sqb =>
        )
    }

}

