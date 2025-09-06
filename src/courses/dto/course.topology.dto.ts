import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { CourseNodeDTO } from "./course.node.dto";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { ApiPolygonProperty, IsPolygon } from "../../utils/decorator";

@ApiExtraModels(CourseNodeDTO)
export class CourseTopologyDTO {
    @ValidateNested({ each: true })
    @Type(() => CourseNodeDTO)
    @ApiProperty({ type: [CourseNodeDTO] })
    nodes: CourseNodeDTO[];

    @IsPolygon()
    @ApiPolygonProperty()
    shape: [number, number][][];
}