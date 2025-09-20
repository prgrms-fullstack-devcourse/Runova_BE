import { BasicPagingOptions, Period } from "../../common/types";

export class SearchRunningRecordsDTO {
    userId: number;
    period?: Period;
    paging?:BasicPagingOptions;
}