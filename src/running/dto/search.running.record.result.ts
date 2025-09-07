import { OmitType } from "@nestjs/swagger";
import { RunningRecordDTO } from "./running.record.dto";
import { ApiPointProperty, IsPoint } from "../../utils/decorator";

export class SearchRunningRecordResult extends OmitType(
    RunningRecordDTO, ["courseId", "path"]
) {
    @IsPoint()
    @ApiPointProperty({ description: "출발지점" })
    departure: [number, number];
}