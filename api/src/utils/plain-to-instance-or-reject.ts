import { ClassTransformOptions, plainToInstance } from "class-transformer";
import { validateOrReject, ValidatorOptions } from "class-validator";
import { Clazz } from "./clazz";

export interface TransformAndValidateOptions {
    transform?: ClassTransformOptions;
    validate?: ValidatorOptions;
}

export async function plainToInstanceOrReject<T extends object>(
    cls: Clazz<T>,
    plain: any,
    options?: TransformAndValidateOptions,
): Promise<T> {
    const instance = plainToInstance(cls, plain, options?.transform);
    await validateOrReject(instance, options?.validate);
    return instance;
}