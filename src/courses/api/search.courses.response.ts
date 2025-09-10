import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { CourseDTO } from "../dto";

@ApiExtraModels(CourseDTO)
export class SearchCoursesResponse {
    @ApiProperty({ type: [CourseDTO] })
    results: CourseDTO[];

    @ApiProperty({
        type: "string",
        nullable: true,
        description: "다음 페이지를 가리키는 커서, 마지막 페이지인 경우 null"
    })
    nextCursor: string | null;
}