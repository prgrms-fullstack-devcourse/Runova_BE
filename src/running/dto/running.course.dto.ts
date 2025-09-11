import { PickType } from "@nestjs/swagger";
import { CourseDTO } from "../../courses/dto";

export class RunningCourseDTO
    extends PickType(CourseDTO, ["id", "title"]) {}