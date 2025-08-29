import { CallHandler, ExecutionContext, Inject, Injectable, Logger } from "@nestjs/common";
import { Cache, CACHE_MANAGER, CacheInterceptor } from "@nestjs/cache-manager";
import type { Request } from "express";
import { Observable, tap } from "rxjs";
import { Caching } from "../../utils/decorator";
import { plainToInstance } from "class-transformer";
import { Reflector } from "@nestjs/core";

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
    private readonly logger: Logger = new Logger(HttpCacheInterceptor.name);

    constructor(
        @Inject(CACHE_MANAGER)
        cacheManager: Cache,
        @Inject(Reflector)
        reflector: Reflector,
    ) {
        super(cacheManager, reflector);
    }

    async intercept(ctx: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const key = this.trackBy(ctx);
        const options = this.reflector.get(Caching, ctx.getHandler());
        if (!(key && options)) return next.handle();

        const raw = await (this.cacheManager as Cache).get(key);
        const req = ctx.switchToHttp().getRequest();

        req.cached = raw !== undefined && options.schema
            ? plainToInstance(options.schema, raw)
            : raw;

        return next.handle().pipe(
            tap(data => {
                if (raw === undefined) {
                    (this.cacheManager as Cache).set(
                        key, data, options.ttl
                    ).catch(err => this.logger.error(err));
                }
            })
        );
    }

    protected trackBy(ctx: ExecutionContext): string | undefined {
        const req: Request = ctx.switchToHttp().getRequest();
        return req.method === "GET" ?  req.originalUrl : undefined;
    }



}