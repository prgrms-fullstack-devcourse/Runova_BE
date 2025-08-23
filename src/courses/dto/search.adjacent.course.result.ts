import { SearchCourseResult } from "./search.course.result";
import { ApiProperty } from "@nestjs/swagger";

export class SearchAdjacentCourseResult extends SearchCourseResult {
    @ApiProperty({ type: "number", description: "현재 위치에서 출발점까지의 거리(km)" })
    distance: number;
}