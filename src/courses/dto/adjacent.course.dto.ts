import { ApiProperty } from "@nestjs/swagger";
import { CourseDTO } from "./course.dto";

export class AdjacentCourseDTO extends CourseDTO {
    @ApiProperty({ type: "number", description: "경로 시작점까지의 거리(m)" })
    distance: number;
}