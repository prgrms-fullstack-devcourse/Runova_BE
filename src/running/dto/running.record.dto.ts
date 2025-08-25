import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { Coordinates } from "../../common/geo";

@ApiExtraModels(Coordinates)
export class RunningRecordDTO {
    @ApiProperty({ type: "integer" })
    id: number;

    @ApiProperty({ type: "integer", nullable: true, description: "경로 아이디(존재하는 경우만)" })
    courseId: number | null;

    @ApiProperty({ type: [Coordinates], description: "달린 경로" })
    path: Coordinates[];

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

    @ApiProperty({ type: "number", description: "평균 속력(km/h)" })
    pace: number;

    @ApiProperty({ type: "number", description: "소모 칼로리(kcal)" })
    calories: number;
}