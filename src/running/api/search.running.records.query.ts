import { IntersectionType } from "@nestjs/swagger";
import { BasicPagingOptions, Period } from "../../common/types";

export class SearchRunningRecordsQuery extends IntersectionType(
    Period, BasicPagingOptions,
) {}