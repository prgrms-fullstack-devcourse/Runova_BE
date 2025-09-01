import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { CourseDTO } from "../dto";

@ApiExtraModels(CourseDTO)
export class SearchCoursesResponse {
    @ApiProperty({ type: [CourseDTO] })
    results: CourseDTO[];
}