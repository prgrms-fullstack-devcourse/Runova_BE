import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { RunningRecordPreviewDTO } from "../dto";
import { Cursor } from "../../common/types";

@ApiExtraModels(RunningRecordPreviewDTO, Cursor)
export class SearchRunningRecordsResponse {
    @ApiProperty({ type: [RunningRecordPreviewDTO] })
    results: RunningRecordPreviewDTO[];

    @ApiProperty({
        type: Cursor,
        nullable: true,
        description: "다음 페이지 커서"
    })
    nextCursor: Cursor | null;
}