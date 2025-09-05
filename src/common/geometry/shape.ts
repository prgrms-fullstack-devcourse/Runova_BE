import { IsLine, Line } from "./line";
import { IsArray, ValidationOptions } from "class-validator";
import { applyDecorators } from "@nestjs/common";

export type Shape = Line[];

export function IsShape(options?: ValidationOptions) {
    return applyDecorators(
        IsArray(options),
        IsLine(options),
    );
}

