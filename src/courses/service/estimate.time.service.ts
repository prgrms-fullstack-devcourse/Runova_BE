import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { RunningRecord } from "../../modules/running";

@Injectable()
export class EstimateTimeService {
    private readonly pace: number;

    constructor(
        @InjectDataSource()
        private readonly ds: DataSource,
        @Inject(ConfigService)
        config: ConfigService,
    ) {
        this.pace = config.get<number>(
            "RUNNER_MEAN_PACE"
        ) ?? 8;
    }

    async estimateTime(userId: number, length: number): Promise<number> {
        const pace = await this.getUserMeanPace(userId);
        return length / pace;
    }

    private async getUserMeanPace(userId: number): Promise<number> {

        const result = await this.ds
            .createQueryBuilder()
            .select("AVG(record.pace)", "pace")
            .from(RunningRecord, "record")
            .where("record.userId = :userId", { userId })
            .groupBy("userId")
            .getRawOne<{ pace: number; }>()

        return  result?.pace || this.pace;
    }
}