import { AggregationFields, InferredAggregationFields, RunningRecordFilters, RunningStatisticsDTO } from "../dto";
import { Query } from "@nestjs/cqrs";

export class GetRunningStatisticsQuery<
   K extends AggregationFields
> extends Query<RunningStatisticsDTO<K>>
{
    constructor(
        public readonly userId: number,
        public readonly props: K[],
        public readonly filters?: RunningRecordFilters,
    ) { super(); }
}
