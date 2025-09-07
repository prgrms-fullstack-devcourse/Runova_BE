import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsInt, IsNumber, IsString } from "class-validator";
import { ApiPointProperty, IsPoint } from "../../utils/decorator";

export class CourseDTO {
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

    @IsString()
    @ApiProperty({ type: "string", description: "작성자 닉네임" })
    author: string;

    @IsBoolean()
    @ApiProperty({ type: "boolean", description: "북마크 여부" })
    bookmarked: boolean;

    @IsBoolean()
    @ApiProperty({ type: "boolean", description: "완주 여부" })
    completed: boolean;
}
