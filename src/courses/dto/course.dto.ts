import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { Coordinates } from "../../common/geo";
import { IsBoolean, IsInt, IsNumber, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

@ApiExtraModels(Coordinates)
export class CourseDTO {
    @IsInt()
    @ApiProperty({ type: "integer" })
    id: number;

    @ValidateNested()
    @Type(() => Coordinates)
    @ApiProperty({ type: Coordinates, description: "시작 지점" })
    departure: Coordinates;

    @IsNumber()
    @ApiProperty({ type: "number", description: "총 거리(m)" })
    length: number;

    @IsNumber()
    @ApiProperty({ type: "number", description: "예상 소요 시간(sec)" })
    time: number;

    @IsInt()
    @ApiProperty({ type: "integer", description: "경로를 달린 사람 수" })
    nCompleted: number;

    @IsBoolean()
    @ApiProperty({ type: "boolean", description: "북마크 여부" })
    bookmarked: boolean;
}
