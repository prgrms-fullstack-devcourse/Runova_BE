import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { AdjacentCourseDTO } from "../dto";

@ApiExtraModels(AdjacentCourseDTO)
export class SearchAdjacentCoursesResponse {
    @ApiProperty({ type: [AdjacentCourseDTO] })
    results: AdjacentCourseDTO[];
}