import { ApiProperty } from "@nestjs/swagger";
import { IsString, ValidateIf } from "class-validator";

export class CourseAuthorDTO {
    @IsString()
    @ApiProperty({ type: "string", description: "작성자 닉네임" })
    nickname: string;

    @IsString()
    @ValidateIf((_, value) => !!value)
    @ApiProperty({ type: "string", nullable: true, description: "작성자 프로필 이미지 경로" })
    avatarUrl: string | null;
}