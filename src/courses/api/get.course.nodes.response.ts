import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { CourseNodeDTO } from "../dto";

@ApiExtraModels(CourseNodeDTO)
export class GetCourseNodesResponse {
    @ApiProperty({ type: [CourseNodeDTO] })
    results: CourseNodeDTO[];
}