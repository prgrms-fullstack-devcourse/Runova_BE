import { OmitType } from "@nestjs/swagger";
import { SearchRunningRecordsDTO } from "../dto";

export class SearchRunningRecordsQuery
    extends OmitType(SearchRunningRecordsDTO, ["userId"]) {}