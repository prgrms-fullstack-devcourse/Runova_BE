import { ApiProperty, IntersectionType, PickType } from "@nestjs/swagger";
import { IsInt } from "class-validator";
import { RunningDashboardDTO } from "./running.dashboard.dto";
import { Clazz } from "../../../utils";

class RecordsCnt {
    @IsInt()
    @ApiProperty({ type: "integer", description: "통계 대상이 된 레코드 수" })
    nRecords: number;
}

export type RunningStatisticsDTO<
    K extends keyof RunningDashboardDTO
> = RecordsCnt & Pick<RunningDashboardDTO, K>;

export function RunningStatisticsSchema<
    K extends keyof RunningDashboardDTO
>(props: K[]): Clazz<RunningStatisticsDTO<K>> {
    return IntersectionType(
        RecordsCnt,
        PickType(RunningDashboardDTO, props)
    ) as Clazz<RunningStatisticsDTO<K>>;
}


