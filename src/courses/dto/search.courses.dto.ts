import { Cursor, PagingOptions } from "../../common/types";

export class SearchCoursesDTO {
    userId: number;
    pace: number;
    paging?: PagingOptions<Cursor>;
}