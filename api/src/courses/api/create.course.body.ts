import {  OmitType } from "@nestjs/swagger";
import { CreateCourseDTO } from "../dto";

export class CreateCourseBody extends OmitType(
    CreateCourseDTO, ["userId"]
) {}