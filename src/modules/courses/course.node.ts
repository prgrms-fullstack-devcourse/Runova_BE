import { IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsPosition, Position } from "../../common/geometry";

export class CourseNode {
    @IsPosition()
    @ApiProperty({ description: "방향 전환 일어나는 곳 위치" })
    location: Position;

    @IsNumber()
    @ApiProperty({
        type: "number",
        description: "출발 지점에서 방향 전환 지점까지의 길이 (km)"
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