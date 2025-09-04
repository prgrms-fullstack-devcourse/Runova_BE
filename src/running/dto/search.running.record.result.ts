import { ApiExtraModels, ApiProperty, OmitType, PickType } from "@nestjs/swagger";
import { RunningRecordDTO } from "./running.record.dto";
import { Coordinates } from "../../common/geo";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";

@ApiExtraModels(Coordinates)
export class SearchRunningRecordResult extends OmitType(
    RunningRecordDTO, ["courseId", "path"]
) {
    @ValidateNested()
    @Type(() => Coordinates)
    @ApiProperty({ type: Coordinates, description: "시작점" })
    departure: Coordinates;
}