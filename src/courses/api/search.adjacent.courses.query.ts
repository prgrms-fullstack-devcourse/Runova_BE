import { ApiExtraModels, ApiProperty, OmitType } from "@nestjs/swagger";
import { SearchAdjacentCoursesCursor } from "../dto";
import { Transform, Type } from "class-transformer";
import { IsNumber, IsOptional, Min, ValidateNested } from "class-validator";
import { IsPoint } from "../../utils/decorator";
import { BasicPagingOptions } from "../../common/types";

@ApiExtraModels(SearchAdjacentCoursesCursor)
export class SearchAdjacentCoursesQuery extends OmitType(
    BasicPagingOptions, ["cursor"]
) {
    @IsPoint()
    @Transform(({ value }) =>
        value && value
            .split(',')
            .map(c => Number(c.trim()))
    )
    @ApiProperty({
        type: "string",
        required: true,
        description: "유저의 현재 경도와 위도를 ,로 연결하여 나타낸 문자열",
        example: "127.0,37.5"
    })
    location: [number, number];

    @Min(100)
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({ type: "number", required: true, minimum: 100, description: "검색 반경(m)" })
    radius: number;

    @ValidateNested()
    @IsOptional()
    @Type(() => SearchAdjacentCoursesCursor)
    @ApiProperty({ type: SearchAdjacentCoursesCursor, required: false })
    cursor?: SearchAdjacentCoursesCursor;
}