import { PagingOptions } from "../../common/query-params";
import { IntersectionType } from "@nestjs/swagger";
import { RunningRecordFilters } from "./running.record.filters";

export class SearchRunningRecordsDTO
    extends IntersectionType(PagingOptions, RunningRecordFilters)
{
    userId: number;
}