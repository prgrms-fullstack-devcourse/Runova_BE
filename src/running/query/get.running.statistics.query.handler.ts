import { IQueryHandler } from "@nestjs/cqrs";
import { GetRunningStatisticsQuery } from "./get.running.statistics.query";
import { AggregationFields, RunningStatisticsDTO, RunningStatisticsSchema } from "../dto";
import { RunningRecord } from "../../modules/running";
import { Repository, SelectQueryBuilder } from "typeorm";
import { setRunningRecordFilters } from "../utils/set.running.record.filters";
import { plainToInstanceOrReject } from "../../utils";

export class GetRunningStatisticsQueryHandler<
   K extends AggregationFields
> implements IQueryHandler<GetRunningStatisticsQuery<K>>
{
    constructor(
        protected readonly recordsRepo: Repository<RunningRecord>
    ) {}

    async execute(
        query: GetRunningStatisticsQuery<K>
    ): Promise<RunningStatisticsDTO<K>> {
        const { userId, props, filters } = query;

        const qb = this
            .createSelectQueryBuilder(new Set(props))
            .where("record.userId = :userId", { userId });

        filters && setRunningRecordFilters(qb, filters);
        qb.groupBy("userId");

        const raw = await qb.getRawOne();
        return plainToInstanceOrReject(RunningStatisticsSchema(props), raw);
    }

    protected createSelectQueryBuilder(
        props: Set<K>
    ): SelectQueryBuilder<RunningRecord> {

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