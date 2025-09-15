import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { RunningCourseDTO } from "./running.course.dto";

@ApiExtraModels(RunningCourseDTO)
export class RunningRecordDTO {
    @ApiProperty({ type: "integer" })
    id: number;

    @ApiProperty({ type: "string", description: "별자리 이미지 경로" })
    artUrl: string;

    @ApiProperty({ type: "string" })
    imageUrl: string;

    @ApiProperty({ type: "number", description: "달린 거리(m)" })
    distance: number;

    @ApiProperty({ type: Date, description: "러닝 시작 일시" })
    startAt: Date;

    @ApiProperty({ type: Date, description: "러닝 종료 일시" })
    endAt: Date;

    @ApiProperty({ type: "number", description: "러닝 지속 시간(sec)" })
    duration: number;

    @ApiProperty({ type: "number", description: "평균 속력(m/s)" })
    pace: number;

    @ApiProperty({ type: "number", description: "총 소모 칼로리(kcal)" })
    calories: number;

    @ApiProperty({
        type: RunningCourseDTO,
        nullable: true,
        description: "따라 뛴 경로의 정보"
    })
    course: RunningCourseDTO | null;
}