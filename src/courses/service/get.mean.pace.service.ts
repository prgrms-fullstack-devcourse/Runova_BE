import { Inject, Injectable } from "@nestjs/common";
import { RunningStatisticsService } from "../../running/service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GetMeanPaceService {
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

    async getMeanPace(userId: number): Promise<number> {

        //const { meanPace } = await this.statsService
            //.getRunningStatistics(userId, ["meanPace"], { limit: 5 });

        return this.defaultMeanPace;
    }

}