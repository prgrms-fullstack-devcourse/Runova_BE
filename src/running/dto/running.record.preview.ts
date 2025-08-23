import { ApiExtraModels, ApiProperty, PickType } from "@nestjs/swagger";
import { RunningRecordDTO } from "./running.record.dto";
import { Coordinates } from "../../common/geo";

@ApiExtraModels(Coordinates)
export class RunningRecordPreview extends PickType(
    RunningRecordDTO,
    ["id", "startAt", "endAt"]
) {
    @ApiProperty({ type: Coordinates, description: "시작점" })
    departure: Coordinates;
}