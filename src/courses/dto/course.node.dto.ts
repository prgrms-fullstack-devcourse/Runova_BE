import { IsNumber, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { Coordinates } from "../../common/geo";

@ApiExtraModels(Coordinates)
export class CourseNodeDTO {
    @ValidateNested()
    @Type(() => Coordinates)
    @ApiProperty({ type: Coordinates, description: "방향 전환 일어나는 곳 투영 좌표" })
    coordinates: Coordinates;

    @IsNumber()
    @ApiProperty({
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "출발지점에서 coordinates 까지의 거리(km)"
    })
    progress: number;

    @IsNumber()
    @ApiProperty({
        type: "number",
        minimum: -180,
        maximum: 180,
        description: "방향전환 시 각도 변화, -180 ~ 180 사이의 값으로 정규화됨"
    })
    bearing: number;
}