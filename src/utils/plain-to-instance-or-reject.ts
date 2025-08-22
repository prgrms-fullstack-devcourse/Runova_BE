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

export async function plainsToInstancesOrReject<T extends object>(
    cls: Clazz<T>,
    plains: any[],
    options?: TransformAndValidateOptions,
): Promise<T[]> {
    return Promise.all(
        plains.map(plain =>
            plainToInstanceOrReject(cls, plain, options)
        )
    );
}