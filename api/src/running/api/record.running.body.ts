import { OmitType } from "@nestjs/swagger";
import { CreateRunningRecordDTO } from "../dto";

export class RecordRunningBody extends OmitType(
    CreateRunningRecordDTO, ["userId"]
) {}