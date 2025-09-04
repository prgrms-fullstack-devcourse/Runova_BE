import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { AdjacentCourseDTO } from "../../courses/dto";

@ApiExtraModels(AdjacentCourseDTO)
export class SearchAdjacentRunningCoursesResponse {
    @ApiProperty({ type: [AdjacentCourseDTO] })
    results: AdjacentCourseDTO[];
}