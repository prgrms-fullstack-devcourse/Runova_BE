import { IsArray, IsNumber, ValidationOptions } from "class-validator";
import { applyDecorators } from "@nestjs/common";
import { ArraySize } from "../../utils/decorator";

export type Position = [number, number];

export function IsPosition(options?: ValidationOptions) {
    return applyDecorators(
        IsArray(options),
        ArraySize(2, options),
        IsNumber({}, options),
    );
}

