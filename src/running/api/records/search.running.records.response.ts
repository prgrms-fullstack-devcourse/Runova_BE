import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { SearchRunningRecordResult } from "../../records/dto/search.running.record.result";

@ApiExtraModels(SearchRunningRecordResult)
export class SearchRunningRecordsResponse {
    @ApiProperty({ type: [SearchRunningRecordResult] })
    results: SearchRunningRecordResult[];
}