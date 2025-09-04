import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { RunningRecord } from "../../modules/running";
import { RunningStatisticsService, RunningRecordsService } from "../service/records";
import { RunningController } from "./controller";

@Module({
    imports: [TypeOrmModule.forFeature([RunningRecord])],
    providers: [
        RunningRecordsService,
        RunningStatisticsService,
    ],
    controllers: [
        RunningController,
    ],
    exports: [RunningStatisticsService],
})
export class RecordsModule {}
