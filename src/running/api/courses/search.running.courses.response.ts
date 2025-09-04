import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { CourseDTO } from "../../courses/dto";

@ApiExtraModels(CourseDTO)
export class SearchRunningCoursesResponse {
    @ApiProperty({ type: [CourseDTO] })
    results: CourseDTO[];
}