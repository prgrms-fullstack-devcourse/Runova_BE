import { IsInt, IsString, IsUrl, ValidateIf } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ApiLineProperty, IsLine } from "../../utils/decorator";

export class CreateCourseDTO {
    userId: number;

    @IsInt()
    @ValidateIf((obj, _) => !obj.path)
    @ApiProperty({ type: "integer", required: false, description: "소스 러닝 기록" })
    runningId?: number;

    @IsLine()
    @ValidateIf((obj, _) => !obj.runningId)
    @ApiLineProperty({ required: true })
    path?: [number, number][];

    @IsString()
    @ApiProperty({ type: "string", required: true })
    title: string;

    @IsUrl()
    @ApiProperty({ type: "string", required: true })
    imageUrl: string;
}