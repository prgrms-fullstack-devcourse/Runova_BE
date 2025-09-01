import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { Coordinates } from "../../common/geo";
import { IsInt, IsNumber, ValidateIf, ValidateNested } from "class-validator";
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

    @ApiProperty({
        type: "string",
        format: "YYYY.MM.DD HH:mm:ss",
        description: "러닝 시작 일시"
    })
    startAt: string;

    @ApiProperty({
        type: "string",
        format: "YYYY.MM.DD HH:mm:ss",
        description: "러닝 종료 일시"
    })
    endAt: string;

    @ApiProperty({
        type: "string",
        format: "HH:mm:ss",
        description: "러닝 지속 시간"
    })
    duration: string;

    @IsNumber()
    @ApiProperty({ type: "number", description: "평균 속력(km/h)" })
    pace: number;

    @IsNumber()
    @ApiProperty({ type: "number", description: "총 소모 칼로리(kcal)" })
    calories: number;
}