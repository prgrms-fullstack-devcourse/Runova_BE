import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsInt, IsNumber, IsString, ValidateIf, ValidateNested } from "class-validator";
import { ApiPointProperty, IsPoint } from "../../utils/decorator";
import { Transform, Type } from "class-transformer";
import { CourseAuthorDTO } from "./course.author.dto";

@ApiExtraModels(CourseAuthorDTO)
export class CourseDTO {
    @IsInt()
    @ApiProperty({ type: "integer" })
    id: number;

    @ValidateNested()
    @Type(() => CourseAuthorDTO)
    @ApiProperty({ type: CourseAuthorDTO, description: "작성자 정보" })
    author: CourseAuthorDTO;

    @IsBoolean()
    @ApiProperty({ type: "boolean", description: "북마크 여부" })
    bookmarked: boolean;

    @IsBoolean()
    @ApiProperty({ type: "boolean", description: "완주 여부" })
    completed: boolean;

    @IsString()
    @ApiProperty({ type: "string" })
    title: string;

    @IsString()
    @ApiProperty({ type: "string", description: "이미지 경로" })
    imageUrl: string;

    @IsPoint()
    @ApiPointProperty({ description: "출발지점" })
    departure: [number, number];

    @IsNumber()
    @ApiProperty({ type: "number", description: "총 거리(m)" })
    length: number;

    @IsNumber()
    @ApiProperty({ type: "number", description: "예상 소요 시간(sec)" })
    time: number;

    @IsDate()
    @ApiProperty({ type: Date, description: "생성일" })
    createdAt: Date;

    @IsNumber()
    @ValidateIf((_, value) => value !== null)
    @Transform(({ value }) => value ?? null)
    @ApiProperty({
        type: "number",
        nullable: true,
        description: "유저의 현재 위치에서 departure 까지의 거리 (현재 위치가 주어지지 않으면 null)"
    })
    distance: number | null;
}
