import { ApiExtraModels, ApiProperty, OmitType } from "@nestjs/swagger";
import { CourseDTO } from "./course.dto";
import { ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Location } from "../../common/geo";

@ApiExtraModels(Location)
export class SearchCourseResult extends OmitType(
    CourseDTO, ["nodes"]
) {
    @ValidateNested()
    @Type(() => Location)
    @ApiProperty({ type: Location, description: "시작 지점" })
    departure: Location;
}