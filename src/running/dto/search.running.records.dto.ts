import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional } from "class-validator";

export class SearchRunningRecordsDTO {
    userId: number;

    @IsInt()
    @IsOptional()
    @ApiProperty({ type: "integer", required: false, default: 0 })
    cursor?: number;

    @IsInt()
    @IsOptional()
    @ApiProperty({ type: "integer", required: false, default: 10 })
    limit?: number;

}