import { OmitType } from "@nestjs/swagger";
import { CreateRunningRecordDTO } from "../dto";

export class CreateRunningRecordBody extends OmitType(
    CreateRunningRecordDTO, ["userId"]
) {}