import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class Coordinates {
    @IsNumber()
    @ApiProperty({ type: "number", description: "+동쪽 방향" })
    x: number;

    @IsNumber()
    @ApiProperty({ type: "number", description: "+북쪽 방향" })
    y: number;

    constructor(other?: Coordinates) {
        other && Object.assign(this, other);
    }
}