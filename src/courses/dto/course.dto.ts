import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { CourseNodeDTO } from "./course.node.dto";

@ApiExtraModels(CourseNodeDTO)
export class CourseDTO {
    @ApiProperty({ type: "integer" })
    id: number;

    @ApiProperty({ type: "number", description: "총 거리(km)" })
    length: number;

    @ApiProperty({ type: "string", pattern: "hh:mm:ss", description: "예상 소요 시간" })
    timeRequired: string;

    @ApiProperty({ type: "integer", description: "경로를 달린 사람 수" })
    nCompleted: number;

    @ApiProperty({ type: [CourseNodeDTO] })
    nodes: CourseNodeDTO[];
}
