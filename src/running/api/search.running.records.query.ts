import { IntersectionType, OmitType } from "@nestjs/swagger";
import { SearchRunningRecordsDTO } from "../dto";
import { PagingOptions, Period } from "../../common/types";

export class SearchRunningRecordsQuery
    extends IntersectionType(Period, PagingOptions) {}