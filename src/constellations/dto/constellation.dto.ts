import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, IsString } from "class-validator";
import { Author } from "../../common/types";
import { ApiPointProperty, IsPoint } from "../../utils/decorator";

@ApiExtraModels(Author)
export class ConstellationDTO {
    @IsInt()
    @ApiProperty({ type: "integer" })
    id: number;

    @IsString()
    @ApiProperty({ type: "string" })
    title: string;

    @IsString()
    @ApiProperty({ type: "string", description: "이미지 경로" })
    imageUrl: string;

    @IsPoint()
    @ApiPointProperty({ description: "출발지점" })
    head: [number, number];

    @IsNumber()
    @ApiProperty({ type: "number", description: "총 길이(m)" })
    length: number;
}