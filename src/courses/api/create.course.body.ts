import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { Coordinates } from "../../common/geo";
import { Type } from "class-transformer";
import { ArrayMinSize, ValidateNested } from "class-validator";

@ApiExtraModels(Coordinates)
export class CreateCourseBody {
    @ArrayMinSize(2)
    @ValidateNested({ each: true })
    @Type(() => Coordinates)
    @ApiProperty({ type: [Coordinates], required: true, maxItems: 2 })
    path: Coordinates[];
}