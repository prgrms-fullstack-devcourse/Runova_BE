import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";

export class RecordRunningQuery {
    @IsInt()
    @IsOptional()
    @Type(() => Number)
    @ApiProperty({ type: "integer", required: false, description: "따라뛴 경로 아이디" })
    courseId?: number;
}