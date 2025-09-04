import { IsNumber, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CourseNodeDTO } from "./course.node.dto";

export class InspectPathResult {
    // unit = km
    @IsNumber()
    length: number;

    @ValidateNested({ each: true })
    @Type(() => CourseNodeDTO)
    nodes: CourseNodeDTO[];
}