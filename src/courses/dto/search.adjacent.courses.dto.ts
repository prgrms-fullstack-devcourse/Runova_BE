import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { Coordinates } from "../../common/geo";
import { Type } from "class-transformer";
import { IsNumber, IsPositive, ValidateNested } from "class-validator";
import { SearchCoursesDTO } from "./search.courses.dto";

@ApiExtraModels(Coordinates)
export class SearchAdjacentCoursesDTO extends SearchCoursesDTO{
    @ValidateNested()
    @Type(() => Coordinates)
    @ApiProperty({ type: Coordinates, required: true, description: "현재 위치" })
    location: Coordinates;

    @IsPositive()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({ type: "number", required: true, minimum: 0.001, description: "검색 반경(km)" })
    radius: number;
}