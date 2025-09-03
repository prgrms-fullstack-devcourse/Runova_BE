import { Injectable, Logger } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";

// --ToDO 유저수/러닝 기록 수 많아 졌을 때, 집계 쿼리를 효율적으로 하는 법 고안
@Injectable()
export class RefreshRunningStatisticsService {
    private readonly logger: Logger = new Logger(RefreshRunningStatisticsService.name);

    constructor(
       @InjectDataSource()
       private readonly ds: DataSource,
    ) {}

    @Cron(CronExpression.EVERY_4_HOURS)
    async refreshRunningStatistics() {
        try {
            this.logger.log('Refreshing materialized view: running_statistics_mv');

            await this.ds.query(
                `REFRESH MATERIALIZED VIEW CONCURRENTLY running_statistics_mv`
            );

            this.logger.log('Successfully refreshed running_statistics_mv');
        } catch (err) {
            this.logger.error('Failed to refresh running_statistics_mv', err);
        }
    }

}