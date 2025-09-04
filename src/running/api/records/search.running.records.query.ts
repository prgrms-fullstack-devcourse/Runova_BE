import { OmitType } from "@nestjs/swagger";
import { SearchRunningRecordsDTO } from "../../records/dto";

export class SearchRunningRecordsQuery
    extends OmitType(SearchRunningRecordsDTO, ["userId"]) {}