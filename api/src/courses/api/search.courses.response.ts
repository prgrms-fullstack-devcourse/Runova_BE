import { ApiExtraModels, ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { CourseDTO, SearchAdjacentCoursesCursor } from "../dto";
import { Cursor } from "../../common/types";

@ApiExtraModels(CourseDTO, Cursor, SearchAdjacentCoursesCursor)
export class SearchCoursesResponse {
    @ApiProperty({ type: [CourseDTO] })
    results: CourseDTO[];

    @ApiProperty({
        type: "string",
        format: "json",
        oneOf: [
            { $ref: getSchemaPath(() => Cursor) },
            { $ref: getSchemaPath(() => SearchAdjacentCoursesCursor) },
        ],
        nullable: true,
        description: "다음 페이지를 가리키는 커서, 마지막 페이지인 경우 null"
    })
    nextCursor: string | null;
}