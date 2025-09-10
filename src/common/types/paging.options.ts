import { IsInt, IsOptional } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class PagingOptions {
    @IsInt()
    @IsOptional()
    @Transform(({ value }) => value && Number(value))
    @ApiProperty({ type: "integer", required: false })
    cursor?: number;

    @IsInt()
    @IsOptional()
    @Transform(({ value }) => value && Number(value))
    @ApiProperty({ type: "integer", required: false })
    limit?: number;
}