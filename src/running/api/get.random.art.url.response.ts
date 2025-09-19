import { ApiProperty } from "@nestjs/swagger";

export class GetRandomArtUrlResponse {
    @ApiProperty({ type: "string", nullable: true, description: "별자리 이미지 경로 & 러닝 기록 없을시 null" })
    artUrl: string | null;
}