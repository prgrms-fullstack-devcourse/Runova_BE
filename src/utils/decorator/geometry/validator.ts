import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

function __MakeValidator(validate: (value: any) => boolean) {
    return function (options?: ValidationOptions) {
        return function (obj: any, propName: string) {
            registerDecorator({
                target: obj.constructor,
                propertyName: propName,
                options: options,
                constraints: [],
                validator: {
                    validate: (value: any, _?: ValidationArguments) =>
                        validate(value)
                }
            })
        };
    }
}

function __isPoint(value: any): value is [number, number] {
    if (!Array.isArray(value)) return false;
    if (value.length !== 2) return false;

    if (typeof value[0] !== 'number' || value[0] > 180 || value[0] < -180)
        return false;

    return typeof value[1] === 'number' && value[1] <= 90 && value[1] >= -90;
}

function __isLine(value: any): value is [number, number][] {
    if (!Array.isArray(value)) return false;
    return value.every(__isPoint);
}

function __isPolygon(value: any): value is [number, number][][] {
    if (!Array.isArray(value)) return false;
    return value.every(__isLine);
}

export const IsPoint = __MakeValidator(__isPoint);
export const IsLine = __MakeValidator(__isLine);
export const IsPolygon = __MakeValidator(__isPolygon);

