import { PickType } from "@nestjs/swagger";
import { RunningRecordDTO } from "./running.record.dto";

export class RunningRecordPreviewDTO extends PickType(
    RunningRecordDTO, ["id", "artUrl", "imageUrl"]
) {}