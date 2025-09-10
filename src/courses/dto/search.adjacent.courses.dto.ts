import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsNumber, Min } from "class-validator";
import { IsPoint } from "../../utils/decorator";

export class SearchAdjacentCoursesDTO {
    userId: number;
    pace: number;

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
}