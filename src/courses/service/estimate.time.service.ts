import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EstimateTimeService {
    private readonly pace: number;

    constructor(
        @Inject(ConfigService)
        config: ConfigService,
    ) {
        this.pace = config.get<number>(
            "RUNNER_MEAN_PACE"
        ) ?? 1.7;
    }

    estimateTime(length: number): number {
        return Math.round((length / this.pace) * 1000);
    }
}