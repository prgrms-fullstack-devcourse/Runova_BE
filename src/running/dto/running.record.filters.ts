//--ToDo 필터 조건 확정하기
import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsOptional } from "class-validator";
import { Transform } from "class-transformer";

export class RunningRecordFilters {

    @IsDate()
    @IsOptional()
    @Transform(({ value }) => value && new Date(value))
    @ApiProperty({ type: Date })
    startDate?: Date;
}