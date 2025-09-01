import { IsInt, IsOptional } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class PagingOptions {
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