import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { StarDTO } from "./star.dto";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { ApiPolygonProperty, IsPolygon } from "../../utils/decorator";

@ApiExtraModels(StarDTO)
export class ConstellationTopologyDTO {
    @IsPolygon()
    @ApiPolygonProperty()
    shape: [number, number][][];

    @ValidateNested({ each: true })
    @Type(() => StarDTO)
    @ApiProperty({ type: [StarDTO] })
    stars: StarDTO[];
}