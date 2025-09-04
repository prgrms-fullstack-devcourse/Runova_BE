import { OmitType } from "@nestjs/swagger";
import { CreateRunningRecordDTO } from "../../records/dto";

export class CreateRunningRecordBody extends OmitType(
    CreateRunningRecordDTO, ["userId"]
) {}