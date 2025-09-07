import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { CourseDTO } from "../dto";
import { SearchCoursesResponse } from "../api";
import { RunningStatisticsService } from "../../running/service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SearchCoursesInterceptor
    implements NestInterceptor<CourseDTO[], SearchCoursesResponse>
{
    private readonly defaultMeanPace: number;

    constructor(
        @Inject(RunningStatisticsService)
        private readonly statsService: RunningStatisticsService,
        @Inject(ConfigService)
        config: ConfigService,
    ) {
        this.defaultMeanPace = config.get<number>(
            "RUNNER_DEFAULT_MEAN_PACE"
        ) ?? 1.7;
    }

    async intercept(
        ctx: ExecutionContext,
        next: CallHandler<CourseDTO[]>
    ): Promise<Observable<SearchCoursesResponse>> {
        const req = ctx.switchToHttp().getRequest();
        req.user.meanPace = await this.getMeanPace(req.user.userId);

        return next.handle().pipe(
            map(results => ({ results }))
        );
    }

    private async getMeanPace(userId: number): Promise<number> {

        const { meanPace } = await this.statsService
            .getRunningStatistics(userId, ["meanPace"], { limit: 5 });

        return meanPace || this.defaultMeanPace;
    }
}