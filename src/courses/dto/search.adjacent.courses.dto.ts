import { PagingOptions } from "../../common/types";
import { SearchAdjacentCoursesCursor } from "./search.adjacent.courses.cursor";
import { SearchCoursesDTO } from "./search.courses.dto";

export type SearchAdjacentCoursesDTO
    = Omit<SearchCoursesDTO, "paging">
    & {
    location: [number, number];
    radius: number;
    paging?: PagingOptions<SearchAdjacentCoursesCursor>
};