import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { SearchAdjacentCourseResult } from "../dto";

@ApiExtraModels(SearchAdjacentCourseResult)
export class SearchAdjacentCoursesResponse {
    @ApiProperty({ type: [SearchAdjacentCourseResult] })
    results: SearchAdjacentCourseResult[];
}