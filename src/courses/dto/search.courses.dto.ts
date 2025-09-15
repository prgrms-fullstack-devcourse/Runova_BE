import { BasicPagingOptions } from "../../common/types";

export interface SearchCoursesDTO {
    userId: number;
    pace: number;
    paging?: BasicPagingOptions;
}