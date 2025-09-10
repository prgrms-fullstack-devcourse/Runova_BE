import { IsInt } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class Cursor {
    @IsInt()
    @ApiProperty({
        type: "integer",
        required: true,
        description: "이전 페이지 맨 마지막 항목의 id 값"
    })
    lastId: number;
}