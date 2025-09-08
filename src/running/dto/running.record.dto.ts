import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsInt, IsNumber, IsString } from "class-validator";
import { ApiLineProperty, IsLine } from "../../utils/decorator";


export class RunningRecordDTO {
    @IsInt()
    @ApiProperty({ type: "integer" })
    id: number;

    @IsLine()
    @ApiLineProperty()
    path: [number, number][];

    @IsString()
    @ApiProperty({ type: "string", description: "별자리 이미지 경로" })
    artUrl: string;

    @IsNumber()
    @ApiProperty({ type: "number", description: "달린 거리(m)" })
    distance: number;

    @IsDate()
    @ApiProperty({
        type: Date,
        description: "러닝 시작 일시"
    })
    startAt: Date;

    @IsDate()
    @ApiProperty({
        type: Date,
        description: "러닝 종료 일시"
    })
    endAt: Date;

    @ApiProperty({
        type: "number",
        description: "러닝 지속 시간(sec)"
    })
    duration: number;

    @IsNumber()
    @ApiProperty({ type: "number", description: "평균 속력(m/s)" })
    pace: number;

    @IsNumber()
    @ApiProperty({ type: "number", description: "총 소모 칼로리(kcal)" })
    calories: number;
}