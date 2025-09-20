import { PickType } from "@nestjs/swagger";
import { RunningRecordDTO } from "../dto";

export class RecordRunningResponse extends PickType(
    RunningRecordDTO, ["id"]
) {}