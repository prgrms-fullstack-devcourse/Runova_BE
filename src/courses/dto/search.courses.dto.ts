import { PagingOptions } from "../../common/query-params";
import { SearchCoursesFilters } from "./search.courses.filters";

export class SearchCoursesDTO {
    userId: number;
    meanPace: number;
    location?: [number, number];
    filters?: SearchCoursesFilters;
    paging?: PagingOptions;
}