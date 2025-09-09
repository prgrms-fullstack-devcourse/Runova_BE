import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from "@nestjs/common";
import { SearchCoursesResponse } from "../api";
import { Observable } from "rxjs";
import { GetRecentPaceService } from "../service";
import { HOUR_IN_MS } from "../../common/constants/datetime";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";

const __TTL = 12 * HOUR_IN_MS;

@Injectable()
export class SearchCoursesInterceptor
    implements NestInterceptor<
        SearchCoursesResponse,
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
        next: CallHandler<SearchCoursesResponse>
    ): Promise<Observable<SearchCoursesResponse>> {
        const req = ctx.switchToHttp().getRequest();
        req.user.pace = await this.getPace(req.user.userId);
        return next.handle();
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