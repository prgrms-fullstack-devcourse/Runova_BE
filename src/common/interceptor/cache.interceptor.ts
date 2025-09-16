import { CallHandler, ExecutionContext, Inject, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Request } from "express";
import { Observable, tap } from "rxjs";
import { Caching, CachingOptions } from "../../utils/decorator";
import { plainToInstanceOrReject } from "../../utils";
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
        const options: CachingOptions = this.reflector.get(Caching, ctx.getHandler());
        if (!options) return next.handle();

        const key = __extractKey(ctx, options.personal);
        if (!(key && options)) return next.handle();

        const raw = await this.cacheManager.get(key);
        const req = ctx.switchToHttp().getRequest();

        req.cached = raw !== undefined && options.schema
            ? await plainToInstanceOrReject(options.schema, raw)
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

function __extractKey(ctx: ExecutionContext, personal?: boolean): string | null {
    const req: Request = ctx.switchToHttp().getRequest();
    if (req.method !== "GET") return null;

    const query = req.query ?? {};
    personal && (query.userId = String(req.user!["userId"]));

    return req.path + '?' + MD5(query);
}

