import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt } from "class-validator";

export class Cursor {
    @IsInt()
    @Type(() => Number)
    @ApiProperty({ type: "integer", required: true })
    id: number;
}