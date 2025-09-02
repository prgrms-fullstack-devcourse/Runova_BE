import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { RunningRecord } from "../modules/running";
import { RunningDashboardsService, RunningRecordsService } from "./service";
import { RunningRecordsController } from "./controller";

@Module({
    imports: [TypeOrmModule.forFeature([RunningRecord])],
    providers: [
        RunningRecordsService,
        RunningDashboardsService,
    ],
    controllers: [
        RunningRecordsController,
        RunningDashboardsService,
    ]
})
export class RunningModule {}
