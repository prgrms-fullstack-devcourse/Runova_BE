import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { Coordinates } from "../../common/geo";
import { IsDate, IsInt, IsNumber, ValidateIf, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

@ApiExtraModels(Coordinates)
export class RunningRecordDTO {
    @IsInt()
    @ApiProperty({ type: "integer" })
    id: number;

    @IsInt()
    @ValidateIf((_, val) => val !== null)
    @ApiProperty({ type: "integer", nullable: true, description: "경로 아이디(존재하는 경우만)" })
    courseId: number | null;

    @ValidateNested({ each: true })
    @Type(() => Coordinates)
    @ApiProperty({ type: [Coordinates], description: "달린 경로" })
    path: Coordinates[];

    @IsNumber()
    @ApiProperty({ type: "number", description: "달린 거리(km)" })
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