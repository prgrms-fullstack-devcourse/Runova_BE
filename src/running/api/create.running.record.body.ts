import { OmitType } from "@nestjs/swagger";
import { RecordRunningDTO } from "../dto";

export class CreateRunningRecordBody extends OmitType(
    RecordRunningDTO, ["userId"]
) {}