import {  OmitType } from "@nestjs/swagger";
import { CreateCourseDTO } from "../../courses/dto";

export class CreateRunningCourseBody extends OmitType(
    CreateCourseDTO, ["userId"]
) {}