import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsInt, IsNumber, IsOptional } from "class-validator";
import { ApiLineProperty, IsLine } from "../../utils/decorator";

export class CreateRunningRecordDTO {
    userId: number;

    @IsInt()
    @IsOptional()
    @ApiProperty({
        type: "integer",
        required: false,
        description: "경로 아이디(그린 경로 따라 뛴 경우만)"
    })
    courseId?: number;

    @IsLine()
    @ApiLineProperty({ required: true })
    path: [number, number][];

    @IsNumber()
    @ApiProperty({
        type: "number",
        required: true,
        description: "달린 거리(m)"
    })
    distance: number;

    @IsDate()
    @ApiProperty({ type: Date, required: true, description: "러닝 시작 일시"})
    startAt: Date;

    @IsDate()
    @ApiProperty({ type: Date, required: true, description: "러닝 종료 일시"})
    endAt: Date;

    @IsNumber()
    @ApiProperty({ type: "number", required: true, description: "평균 속력(m/s)" })
    pace: number;

    @IsNumber()
    @ApiProperty({ type: "number", required: true, description: "소모 칼로리(kcal)" })
    calories: number;
}