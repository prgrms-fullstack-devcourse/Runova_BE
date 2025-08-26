import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { CourseNodeDTO } from "./course.node.dto";
import { IsInt, IsNumber, IsString  } from "class-validator";

@ApiExtraModels(CourseNodeDTO)
export class CourseDTO {
    @IsInt()
    @ApiProperty({ type: "integer" })
    id: number;

    @IsNumber()
    @ApiProperty({ type: "number", description: "총 거리(km)" })
    length: number;

    @IsString()
    @ApiProperty({ type: "string", pattern: "hh:mm:ss", description: "예상 소요 시간" })
    timeRequired: string;

    @IsInt()
    @ApiProperty({ type: "integer", description: "경로를 달린 사람 수" })
    nCompleted: number;

    @ApiProperty({ type: [CourseNodeDTO] })
    nodes: CourseNodeDTO[];
}
