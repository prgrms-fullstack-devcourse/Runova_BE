import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsPositive } from "class-validator";
import { PagingOptions } from "../../common/paging";
import { ApiPositionProperty, IsPosition, Position } from "../../common/geometry";

export class SearchAdjacentCoursesDTO extends PagingOptions {
    userId: number;

    @IsPosition()
    @ApiPositionProperty({ required: true })
    location: Position;

    @IsPositive()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({ type: "number", required: true, minimum: 100, description: "검색 반경(m)" })
    radius: number;
}