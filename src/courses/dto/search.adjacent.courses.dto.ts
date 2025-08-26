import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { Location } from "../../common/geo";
import { Type } from "class-transformer";
import { IsNumber, IsPositive, ValidateNested } from "class-validator";
import { SearchCoursesDTO } from "./search.courses.dto";

@ApiExtraModels(Location)
export class SearchAdjacentCoursesDTO extends SearchCoursesDTO{
    @ValidateNested()
    @Type(() => Location)
    @ApiProperty({ type: Location, required: true, description: "현재 위치" })
    location: Location;

    @IsPositive()
    @IsNumber()
    @Type(() => Number)
    @ApiProperty({ type: "number", required: true, minimum: 0.001, description: "검색 반경(km)" })
    radius: number;
}