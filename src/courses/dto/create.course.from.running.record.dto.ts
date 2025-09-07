import { OmitType } from "@nestjs/swagger";
import { CreateCourseDTO } from "./create.course.dto";

export class CreateCourseFromRunningRecordDTO
    extends OmitType(CreateCourseDTO, ["path"])
{
    recordId: number;
}