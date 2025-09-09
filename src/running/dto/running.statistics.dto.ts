import { ApiProperty, IntersectionType, PickType } from "@nestjs/swagger";
import { IsInt } from "class-validator";
import { RunningAggregationDTO } from "./running.aggregation.dto";
import { Clazz } from "../../utils";

class RecordsCnt {
    @IsInt()
    @ApiProperty({ type: "integer", description: "통계 대상이 된 레코드 수" })
    nRecords: number;
}

export type RunningStatisticsDTO<
    K extends keyof RunningAggregationDTO
> = RecordsCnt & Pick<RunningAggregationDTO, K>;

export function RunningStatisticsSchema<
    K extends keyof RunningAggregationDTO
>(props: K[]): Clazz<RunningStatisticsDTO<K>> {
    return IntersectionType(
        RecordsCnt,
        PickType(RunningAggregationDTO, props)
    ) as Clazz<RunningStatisticsDTO<K>>;
}


