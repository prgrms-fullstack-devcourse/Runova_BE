import { Controller, Get, Inject, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { RunningDashboardsService } from "../service";
import { Cached, Caching, User } from "../../utils/decorator";
import { AuthGuard } from "@nestjs/passport";
import { RunningDashboardDTO } from "../dto";
import { Period } from "../../common/types";
import { HOUR_IN_MS } from "../../common/constants/datetime";
import { CacheInterceptor } from "../../common/interceptor";

@ApiTags("Running", "Dashboards")
@Controller("/api/running/dashboards")
@UseGuards(AuthGuard("jwt"))
@UseInterceptors(CacheInterceptor)
export class RunningDashboardsController {

    constructor(
       @Inject(RunningDashboardsService)
       private readonly dashboardsService: RunningDashboardsService,
    ) {}

    @Get("/")
    @ApiOperation({ summary: "유저 러닝 관련 통계 조회" })
    @ApiBearerAuth()
    @ApiQuery({ type: Period, required: false })
    @ApiOkResponse({ type: RunningDashboardDTO })
    @ApiForbiddenResponse()
    @Caching({ ttl: HOUR_IN_MS, personal: true })
    async getRunningDashboard(
        @User("userId") userId: number,
        @Query() query?: Period,
        @Cached() data?: RunningDashboardDTO,
    ): Promise<RunningDashboardDTO> {
        return data ?? await this.dashboardsService
            .getRunningDashboard(userId, query);
    }

}