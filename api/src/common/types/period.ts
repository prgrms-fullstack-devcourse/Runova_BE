import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDate, IsOptional } from "class-validator";

export class Period {
    @IsDate()
    @IsOptional()
    @Transform(({ value }) => value && new Date(value))
    @ApiProperty({ type: Date, required: false })
    since?: Date;

    @IsDate()
    @IsOptional()
    @Transform(({ value }) => value && new Date(value))
    @ApiProperty({ type: Date, required: false })
    until?: Date;
}