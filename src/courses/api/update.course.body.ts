import { OmitType } from "@nestjs/swagger";
import { UpdateCourseDTO } from "../dto";

export class UpdateCourseBody extends OmitType(
    UpdateCourseDTO, ["id", "userId"]
) {}