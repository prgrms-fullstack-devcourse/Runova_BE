import { OmitType } from "@nestjs/swagger";
import { SearchAdjacentCoursesDTO } from "../../courses/dto";

export class SearchAdjacentRunningCoursesQuery extends OmitType(
    SearchAdjacentCoursesDTO, ["userId"]
) {}