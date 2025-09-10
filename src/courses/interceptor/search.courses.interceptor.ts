import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from "@nestjs/common";
import { SearchCoursesResponse } from "../api";
import { map, Observable } from "rxjs";
import { GetRecentPaceService } from "../service";
import { HOUR_IN_MS } from "../../common/constants/datetime";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { CourseDTO } from "../dto";

const __TTL = 12 * HOUR_IN_MS;

@Injectable()
export class SearchCoursesInterceptor
    implements NestInterceptor<
        CourseDTO[],
        SearchCoursesResponse
    >
{

    constructor(
        @Inject(GetRecentPaceService)
        private getRecentPaceService: GetRecentPaceService,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
    ) {}

    async intercept(
        ctx: ExecutionContext,
        next: CallHandler<CourseDTO[]>
    ): Promise<Observable<SearchCoursesResponse>> {
        const req = ctx.switchToHttp().getRequest();
        req.user.pace = await this.getPace(req.user.userId);

        if (req.cached?.results) {
            req.cached = req.cached.results;
        }

        return next.handle().pipe(
            map(results => {
                const nextCursor = __makeNextCursor(results);
                return { results, nextCursor };
            })
        )
    }

    private async getPace(userId: number): Promise<number> {
        const pace = await this.cacheManager.get<number>(__makeKey(userId));
        return pace ?? await this.getRecentPace(userId);
    }

    private async getRecentPace(userId: number): Promise<number> {
        const pace = await this.getRecentPaceService.getRecentPace(userId);
        await this.cacheManager.set<number>(__makeKey(userId), pace, __TTL);
        return pace;
    }

}

function __makeKey(userId: number): string {
    return `user:${userId}:pace`;
}

function __makeNextCursor(
    results: CourseDTO[],
): string | null {
    const last = results.at(-1);
    if (!last) return null;

    return JSON.stringify(
        last.distance === null
            ?  { id: last.id }
            : { id: last.id, distance: last.distance }
    );
}