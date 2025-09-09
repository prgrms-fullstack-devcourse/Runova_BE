import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { CourseNodeDTO } from "./course.node.dto";
import { ApiPolygonProperty } from "../../utils/decorator";

@ApiExtraModels(CourseNodeDTO)
export class CourseTopologyDTO {
    @ApiProperty({ type: [CourseNodeDTO] })
    nodes: CourseNodeDTO[];

    @ApiPolygonProperty()
    shape: [number, number][][];
}