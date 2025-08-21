import { ClassTransformOptions, plainToInstance } from "class-transformer";
import { validateOrReject, ValidatorOptions } from "class-validator";

export interface TransformAndValidateOptions {
    transform?: ClassTransformOptions;
    validate?: ValidatorOptions;
}

export async function plainToInstanceOrReject<T extends object>(
    Clazz: { new (...args: any[]): T },
    plain: any,
    options?: TransformAndValidateOptions,
): Promise<T> {
    const instance = plainToInstance(Clazz, plain, options?.transform);
    await validateOrReject(instance, options?.validate);
    return instance;
}