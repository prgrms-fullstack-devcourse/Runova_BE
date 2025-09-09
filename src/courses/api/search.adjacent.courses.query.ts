import { OmitType } from "@nestjs/swagger";
import { SearchAdjacentCoursesDTO } from "../dto";

export class SearchAdjacentCoursesQuery extends OmitType(
    SearchAdjacentCoursesDTO, ["userId", "pace"]
) {}