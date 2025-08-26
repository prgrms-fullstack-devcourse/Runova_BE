import { ApiExtraModels, ApiProperty, PickType } from "@nestjs/swagger";
import { RunningRecordDTO } from "./running.record.dto";
import { Location } from "../../common/geo";

@ApiExtraModels(Location)
export class SearchRunningRecordResult extends PickType(
    RunningRecordDTO,
    ["id", "startAt", "endAt"]
) {
    @ApiProperty({ type: Location, description: "시작점" })
    departure: Location;
}