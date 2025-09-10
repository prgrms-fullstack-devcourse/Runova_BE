import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";
import { Cursor } from "../../common/types";

export class SearchAdjacentCoursesCursor extends Cursor{
    @IsNumber()
    @ApiProperty({
        type: "number",
        required: true,
        description: "이전 페이지 맨 마지막 경로의 distance 값"
    })
    lastDistance: number;
}