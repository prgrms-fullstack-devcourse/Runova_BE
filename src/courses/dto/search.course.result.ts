import { OmitType } from "@nestjs/swagger";
import { CourseDTO } from "./course.dto";

export class SearchCourseResult extends OmitType(
    CourseDTO, ["nodes"]
) {}