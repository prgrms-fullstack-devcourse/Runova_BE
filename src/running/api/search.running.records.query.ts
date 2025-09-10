import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { Cursor, Period } from "../../common/types";
import { IsInt, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

@ApiExtraModels(Cursor)
export class SearchRunningRecordsQuery extends Period {
    @ValidateNested()
    @IsOptional()
    @Type(() => Cursor)
    @ApiProperty({ type: Cursor, required: false })
    cursor?: Cursor;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    @ApiProperty({ type: "integer", required: false, default: 10 })
    limit?: number;
}