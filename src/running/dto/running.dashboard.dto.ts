import { ApiProperty, PickType } from "@nestjs/swagger";
import { RunningRecordDTO } from "./running.record.dto";

export class RunningDashboardDTO extends PickType(
    RunningRecordDTO,
    ["distance", "duration", "pace", "calories"]
) {}