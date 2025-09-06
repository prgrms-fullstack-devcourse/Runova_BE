import { ApiProperty, IntersectionType, PickType } from "@nestjs/swagger";
import { IsInt, IsNumber } from "class-validator";
import { Clazz } from "../../utils";

class RecordsAggregationDTO {
    @IsNumber()
    @ApiProperty({ type: "number", description: "달린 총 거리(m)" })
    totalDistance: number;

    @IsNumber()
    @ApiProperty({ type: "number", description: "총 러닝 지속 시간(s))" })
    totalDuration: number;

    @IsNumber()
    @ApiProperty({ type: "number", description: "소모한 총 칼로리(kcal)" })
    totalCalories: number;

    @IsNumber()
    @ApiProperty({ type: "number", description: "평균 페이스(m/s)" })
    meanPace: number;
}

class RecordsCnt {
    @IsInt()
    @ApiProperty({ type: "integer", description: "통계 대상이 된 레코드 수" })
    nRecords: number;
}

export type AggregationFields = keyof RecordsAggregationDTO;

export type RunningStatisticsDTO<
    K extends AggregationFields
> = RecordsCnt & Pick<RecordsAggregationDTO, K>;

export type InferredAggregationFields<T extends RunningStatisticsDTO<any>> =
    T extends RunningStatisticsDTO<infer K extends AggregationFields> ? K : never;

export function RunningStatisticsSchema<
    K extends AggregationFields
>(props: K[]): Clazz<RunningStatisticsDTO<K>> {
    return IntersectionType(
        RecordsCnt,
        PickType(RecordsAggregationDTO, props)
    ) as Clazz<RunningStatisticsDTO<K>>;
}