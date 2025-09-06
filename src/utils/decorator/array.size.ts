import { applyDecorators } from "@nestjs/common";
import { ArrayMaxSize, ArrayMinSize } from "class-validator";

export function ArraySize(size: number) {
    return applyDecorators(
        ArrayMinSize(size),
        ArrayMaxSize(size)
    );
}