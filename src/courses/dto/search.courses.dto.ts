import { IsInt, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class SearchCoursesDTO {
    userId?: number;

    @IsInt()
    @IsOptional()
    @Transform(({ value }) => value && Number(value))
    @ApiProperty({ type: "integer", required: false, default: 0 })
    cursor?: number;

    @IsInt()
    @IsOptional()
    @Transform(({ value }) => value && Number(value))
    @ApiProperty({ type: "integer", required: false, default: 10 })
    limit?: number;
}