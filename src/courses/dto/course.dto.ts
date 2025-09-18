import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { ApiPointProperty } from "../../utils/decorator";
import { Author } from "../../common/types";

@ApiExtraModels(Author)
export class CourseDTO {
    @ApiProperty({ type: "integer" })
    id: number;

    @ApiProperty({ type: "string" })
    title: string;

    @ApiProperty({ type: "string", description: "이미지 경로" })
    imageUrl: string;

    @ApiPointProperty({ description: "출발지점" })
    departure: [number, number];

    @ApiProperty({ type: "number", description: "총 거리(m)" })
    length: number;

    @ApiProperty({ type: "number", description: "예상 소요 시간(sec)" })
    time: number;

    @ApiProperty({ type: Date, description: "생성일" })
    createdAt: Date;

    @ApiProperty({ type: Author, description: "작성자 정보" })
    author: Author;

    @ApiProperty({ type: "boolean", nullable: true, description: "북마크 여부" })
    bookmarked: boolean | null;

    @ApiProperty({
        type: "number",
        nullable: true,
        description: "현재 위치와 'departure' 사이의 거리"
    })
    distance: number | null;
}
