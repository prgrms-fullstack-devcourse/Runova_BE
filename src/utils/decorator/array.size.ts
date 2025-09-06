import { applyDecorators } from "@nestjs/common";
import { ArrayMaxSize, ArrayMinSize, ValidationOptions } from "class-validator";

export function ArraySize(size: number, options?: ValidationOptions) {
    return applyDecorators(
        ArrayMinSize(size, options),
        ArrayMaxSize(size, options),
    );
}