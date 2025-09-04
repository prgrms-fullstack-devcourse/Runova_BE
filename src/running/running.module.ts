import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { RunningRecord } from "../modules/running";
import { RunningStatisticsService, RunningRecordsService } from "./service";
import { RunningRecordsController } from "./controller";

@Module({
    imports: [TypeOrmModule.forFeature([RunningRecord])],
    providers: [
        RunningRecordsService,
        RunningStatisticsService,
    ],
    controllers: [
        RunningRecordsController,
    ],
    exports: [RunningStatisticsService],
})
export class RunningModule {}
