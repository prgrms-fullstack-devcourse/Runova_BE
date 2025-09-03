import { Controller, Get, Inject, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { RunningDashboardsService } from "../service";
import { GetRunningDashboardQuery } from "../api";
import { RunningDashboardDTO } from "../dto";
import { User } from "../../utils/decorator";

@ApiTags("Running", "Dashboard")
@Controller("/api/running/dashboards")
export class RunningDashboardsController {

    constructor(
       @Inject(RunningDashboardsService)
       private readonly dashboardsService: RunningDashboardsService,
    ) {}

    @Get("/")
    @ApiOperation({ summary: "유저 러닝 관련 통계 조회" })
    @ApiBearerAuth()
    @ApiQuery({ type: GetRunningDashboardQuery, required: false })
    @ApiOkResponse({ type: RunningDashboardDTO })
    @ApiForbiddenResponse()
    async getRunningDashboard(
        @User("userId") userId: number,
        @Query() query?: GetRunningDashboardQuery,
    ): Promise<RunningDashboardDTO> {
        return this.dashboardsService
            .getRunningDashboard(userId, query);
    }

}