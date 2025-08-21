import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { CourseDTO } from "../dto";

@ApiExtraModels(CourseDTO)
export class GetCoursesResponse {
    @ApiProperty({ type: [CourseDTO] })
    results: CourseDTO[];
}