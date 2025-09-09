import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsPositive } from "class-validator";
import { PagingOptions } from "../../common/types";
import { ApiPointProperty } from "../../utils/decorator";


export class SearchAdjacentCoursesDTO extends PagingOptions {
    userId: number;

    @ApiPointProperty({ required: true, description: "현재 위치" })
    location: [number, number];

    @IsPositive()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({ type: "number", required: true, minimum: 0.001, description: "검색 반경(km)" })
    radius: number;
}