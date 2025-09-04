import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsDate, IsInt, IsOptional } from "class-validator";

export class RunningRecordFilters {
    @IsDate()
    @IsOptional()
    @Transform(({ value }) => value && new Date(value))
    @ApiProperty({ type: Date, required: false })
    startDate?: Date;

    @IsDate()
    @IsOptional()
    @Transform(({ value }) => value && new Date(value))
    @ApiProperty({ type: Date, required: false })
    endDate?: Date;

    @IsInt()
    @Type(() => Number)
    @ApiProperty({ type: "integer", required: false })
    limit?: number;
}