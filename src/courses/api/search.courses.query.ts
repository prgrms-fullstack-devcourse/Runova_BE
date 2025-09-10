import { IsInt, IsOptional } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class SearchCoursesQuery {
    @IsInt()
    @IsOptional()
    @Transform(({ value }) => value && Number(value))
    @ApiProperty({ type: "integer", required: false, description: "마지막 경로의 id" })
    cursor?: number;

    @IsInt()
    @IsOptional()
    @Transform(({ value }) => value && Number(value))
    @ApiProperty({ type: "integer", required: false })
    limit?: number;
}