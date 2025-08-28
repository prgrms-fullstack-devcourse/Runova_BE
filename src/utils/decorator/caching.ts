import { ReflectableDecorator, Reflector } from "@nestjs/core";
import { Clazz } from "../clazz";

export interface CachingOptions {
    ttl?: number;
    schema?: Clazz<any>;
}

export const Caching: ReflectableDecorator<CachingOptions, CachingOptions>
    = Reflector.createDecorator<CachingOptions>();