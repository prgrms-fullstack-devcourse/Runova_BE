import { IsPosition, Position } from "./position";
import { IsArray, ValidationOptions } from "class-validator";
import { applyDecorators } from "@nestjs/common";

export type Line = Position[];

export function IsLine(options?: ValidationOptions) {
    return applyDecorators(
        IsArray(options),
        IsPosition(options),
    );
}
