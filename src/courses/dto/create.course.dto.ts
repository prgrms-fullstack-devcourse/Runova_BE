import { IsString, IsUrl } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ApiLineProperty, IsLine } from "../../utils/decorator";

export class CreateCourseDTO {
    userId: number;

    @IsString()
    @ApiProperty({ type: "string", required: true })
    title: string;

    @IsUrl()
    @ApiProperty({ type: "string", required: true })
    imageURL: string;

    @IsLine()
    @ApiLineProperty({ required: true })
    path: [number, number][];
}