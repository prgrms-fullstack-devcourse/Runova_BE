import { Cursor } from "../../common/types";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class SearchAdjacentCoursesCursor extends Cursor {
    @IsNumber({ allowNaN: false, allowInfinity: false })
    @Type(() => Number)
    @ApiProperty({ type: "number", required: true })
    distance: number;
}