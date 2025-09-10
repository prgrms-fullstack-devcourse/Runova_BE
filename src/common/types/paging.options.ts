import { Cursor } from "./cursor";
import { Clazz } from "../../utils";
import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { IsInt, IsOptional } from "class-validator";
import { Transform } from "class-transformer";

class PageLimit {
    @IsInt()
    @IsOptional()
    @Transform(({ value }) => value && Number(value))
    @ApiProperty({ type: "integer", required: false, description: "가져올 항목의 갯수" })
    limit?: number;
}

export type PagingOptions<CursorT extends Cursor>
    = { cursor?: CursorT } & PageLimit;

export function PagingOptionsType<
    CursorT extends Cursor
>(cls: Clazz<CursorT>): Clazz<PagingOptions<CursorT>> {
    return IntersectionType(
        cls, PageLimit
    ) as Clazz<PagingOptions<CursorT>>;
}