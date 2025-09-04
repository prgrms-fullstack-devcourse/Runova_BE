import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { CourseNodeDTO } from "../../courses/dto";

@ApiExtraModels(CourseNodeDTO)
export class GetRunningCourseNodesResponse {
    @ApiProperty({ type: [CourseNodeDTO] })
    results: CourseNodeDTO[];
}