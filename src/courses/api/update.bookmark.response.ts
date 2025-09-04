import { PickType } from "@nestjs/swagger";
import { CourseDTO } from "../dto";

export class UpdateBookmarkResponse extends PickType(
    CourseDTO, ["bookmarked"]
) {}