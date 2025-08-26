import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EstimateHoursService {
    private readonly pace: number;

    constructor(
        @Inject(ConfigService)
        config: ConfigService,
    ) {
        this.pace = config.get<number>(
            "RUNNER_MEAN_PACE"
        ) ?? 8;
    }

    estimate(length: number): number {
        return length / this.pace;
    }
}