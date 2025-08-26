import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { Location } from "../../common/geo";
import { Type } from "class-transformer";
import { ArrayMinSize, ValidateNested } from "class-validator";

@ApiExtraModels(Location)
export class CreateCourseBody {
    @ArrayMinSize(2)
    @ValidateNested({ each: true })
    @Type(() => Location)
    @ApiProperty({ type: [Location], required: true, maxItems: 2 })
    path: Location[];
}