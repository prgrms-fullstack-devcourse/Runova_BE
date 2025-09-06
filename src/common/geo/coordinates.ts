import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Max, Min } from "class-validator";

export class Coordinates {
    @Max(180)
    @Min(-180)
    @IsNumber()
    @ApiProperty({ type: "number", minimum: -180, maximum: 180, description: "경도" })
    lon: number;

    @Max(90)
    @Min(-90)
    @IsNumber()
    @ApiProperty({ type: "number", minimum: -90, maximum: 90, description: "위도" })
    lat: number;

    constructor(other?: Coordinates) {
        other && Object.assign(this, other);
    }
}

