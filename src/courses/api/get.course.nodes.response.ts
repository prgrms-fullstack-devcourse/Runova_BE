import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { CourseNode } from "../dto";

@ApiExtraModels(CourseNode)
export class GetCourseNodesResponse {
    @ApiProperty({ type: [CourseNode] })
    results: CourseNode[];
}