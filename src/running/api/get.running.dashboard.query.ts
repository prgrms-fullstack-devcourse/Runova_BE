import { Period } from "../../common/types";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt } from "class-validator";

export class GetRunningDashboardQuery extends Period{
    @IsInt()
    @Transform(({ value }) => value && Number(value))
    @ApiProperty({ type: "integer", required: false })
    limit?: number;
}