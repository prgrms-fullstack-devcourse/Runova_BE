import { OmitType } from "@nestjs/swagger";
import { SearchCoursesDTO } from "../dto";

export class SearchCoursesQuery extends OmitType(
    SearchCoursesDTO, ["userId"]
) {}