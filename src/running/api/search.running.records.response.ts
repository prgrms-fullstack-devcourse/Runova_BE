import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { RunningRecordPreview } from "../dto/running.record.preview";

@ApiExtraModels(RunningRecordPreview)
export class SearchRunningRecordsResponse {
    @ApiProperty({ type: [RunningRecordPreview] })
    results: RunningRecordPreview[];
}