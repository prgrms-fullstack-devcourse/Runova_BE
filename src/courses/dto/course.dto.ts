import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { CourseNodeDTO } from "./course.node.dto";
import { Coordinates } from "../../common/geo";
import { IsInt, IsNumber, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

@ApiExtraModels(Coordinates, CourseNodeDTO)
export class CourseDTO {
    @IsInt()
    @ApiProperty({ type: "integer" })
    id: number;

    @ValidateNested()
    @Type(() => Coordinates)
    @ApiProperty({ type: Coordinates, description: "시작 지점" })
    departure: Coordinates;

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
