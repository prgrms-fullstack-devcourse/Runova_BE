import { ArrayMinSize, IsString, IsUrl, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Coordinates } from "../../common/geometry";
import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";

@ApiExtraModels(Coordinates)
export class CreateCourseDTO {
    userId: number;

    @IsString()
    @ApiProperty({ type: "string", required: true })
    title: string;

    @IsUrl()
    @ApiProperty({ type: "string", required: true })
    imageURL: string;

    @ArrayMinSize(2)
    @ValidateNested({ each: true })
    @Type(() => Coordinates)
    @ApiProperty({ type: [Coordinates], required: true, maxItems: 2 })
    path: Coordinates[];
}