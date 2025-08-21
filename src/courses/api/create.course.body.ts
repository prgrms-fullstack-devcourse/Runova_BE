import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { Coordinates } from "../../common/geo";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";

@ApiExtraModels(Coordinates)
export class CreateCourseBody {
    @ValidateNested({ each: true })
    @Type(() => Coordinates)
    @ApiProperty({ type: [Coordinates], required: true })
    path: Coordinates[];
}