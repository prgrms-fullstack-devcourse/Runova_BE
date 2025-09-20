import { ApiProperty } from "@nestjs/swagger";

export class GetRandomArtUrlResponse {
    @ApiProperty({ type: "string", isArray: true, description: "별자리 이미지 경로 랜덤으로 최대 10개 가져옴" })
    results: string[];
}