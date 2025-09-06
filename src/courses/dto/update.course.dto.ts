import { PartialType, PickType } from "@nestjs/swagger";
import { CreateCourseDTO } from "./create.course.dto";

export class UpdateCourseDTO extends PartialType(
    PickType(CreateCourseDTO, ["title"])
) {
    id: number;
    userId: number;
}