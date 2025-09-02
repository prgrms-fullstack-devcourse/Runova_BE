import { CallHandler, ExecutionContext, Inject, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Request } from "express";
import { Observable, tap } from "rxjs";
import { Caching } from "../../utils/decorator";
import { plainToInstance } from "class-transformer";
import { Reflector } from "@nestjs/core";
import { MD5 } from "object-hash";

@Injectable()
export class CacheInterceptor implements NestInterceptor {
    private readonly logger: Logger = new Logger(CacheInterceptor.name);

    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        @Inject(Reflector)
        private readonly reflector: Reflector,
    ) {}

    async intercept(ctx: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const key = __extractKey(ctx);
        const options = this.reflector.get(Caching, ctx.getHandler());
        if (!(key && options)) return next.handle();

        const raw = await this.cacheManager.get(key);
        const req = ctx.switchToHttp().getRequest();

        req.cached = raw !== undefined && options.schema
            ? plainToInstance(options.schema, raw)
            : raw;

        return next.handle().pipe(
            tap(data => {
                if (raw === undefined) {
                    this.cacheManager.set(key, data, options.ttl)
                        .catch(err => this.logger.error(err));
                }
            })
        );
    }
}

function __extractKey(ctx: ExecutionContext): string | null {
    const req: Request = ctx.switchToHttp().getRequest();
    if (req.method !== "GET") return null;
    const qs = req.query ? MD5(req.query) : '';
    return req.path + '&' + qs;
}