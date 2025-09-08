import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { RunningRecordDTO } from "../dto";

@ApiExtraModels(RunningRecordDTO)
export class SearchRunningRecordsResponse {
    @ApiProperty({ type: [RunningRecordDTO] })
    results: RunningRecordDTO[];
}