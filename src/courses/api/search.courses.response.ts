import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { SearchCourseResult } from "../dto";

@ApiExtraModels(SearchCourseResult)
export class SearchCoursesResponse {
    @ApiProperty({ type: [SearchCourseResult] })
    results: SearchCourseResult[];
}