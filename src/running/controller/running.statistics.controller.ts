import { Controller, Get, Inject, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { RunningStatisticsService } from "../service/records";
import { GetRunningDashboardQuery } from "../api/records";
import { RunningStatisticsDTO } from "../records/dto";
import { User } from "../../utils/decorator";
import { AuthGuard } from "@nestjs/passport";

@ApiTags("Running", "Statistics")
@Controller("/api/running/statistics")
@UseGuards(AuthGuard("jwt"))
export class RunningStatisticsController {

    constructor(
       @Inject(RunningStatisticsService)
       private readonly statisticsService: RunningStatisticsService,
    ) {}

    @Get("/")
    @ApiOperation({ summary: "유저 러닝 관련 통계 조회" })
    @ApiBearerAuth()
    @ApiQuery({ type: GetRunningDashboardQuery, required: false })
    @ApiOkResponse({  })
    @ApiForbiddenResponse()
    async getRunningDashboard(
        @User("userId") userId: number,
        @Query() query?: GetRunningDashboardQuery,
    ) {
        return this.statisticsService
            .getRunningStatistics(
                userId,
                ["totalDistance", "totalDuration", "totalCalories", "meanPace"],
                query
            );
    }

}