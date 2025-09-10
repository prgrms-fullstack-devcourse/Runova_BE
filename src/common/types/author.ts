import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class Author {
  @IsString()
  @ApiProperty({ type: "string" })
  nickname: string;

  @IsString()
  @ApiProperty({ type: "string", format: "url" })
  avatarUrl: string;
}
