import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { RunningRecord } from "../../modules/running";

@Injectable()
export class GetRecentPaceService {
    private readonly defaultPace: number;

    constructor(
        @InjectDataSource()
        private readonly ds: DataSource,
        @Inject(ConfigService)
        config: ConfigService,
    ) {
        this.defaultPace = config.get<number>(
            "RUNNER_AVERAGE_PACE"
        ) ?? 1.7;
    }

    async getRecentPace(userId: number): Promise<number> {

        const result = await this.ds
            .createQueryBuilder()
            .select(`AVG(record.pace)`, "recentPace")
            .from(
                sqb => sqb
                    .select(`record.pace`, "pace")
                    .from(RunningRecord, "record")
                    .where(`record.userId = :userId`, { userId })
                    .orderBy(`record.id`, "DESC")
                    .take(5),
                "record"
            )
            .getRawOne<{ recentPace: number }>();

        return result?.recentPace || this.defaultPace;
    }

}