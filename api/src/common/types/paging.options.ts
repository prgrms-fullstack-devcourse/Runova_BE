import { Cursor } from "./cursor";
import { IsInt, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";

export interface PagingOptions<CursorT extends Cursor> {
    cursor?: CursorT;
    limit?: number;
}

@ApiExtraModels(Cursor)
export class BasicPagingOptions implements PagingOptions<Cursor> {
    @ValidateNested()
    @IsOptional()
    @Type(() => Cursor)
    @ApiProperty({ type: Cursor, required: false })
    cursor?: Cursor;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    @ApiProperty({ type: "integer", required: false })
    limit?: number;
}