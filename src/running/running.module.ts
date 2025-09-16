import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { RunningRecord } from "../modules/running";
import { ContainsPathService, GenerateArtUrlService, RunningDashboardsService, RunningRecordsService } from "./service";
import { RunningDashboardsController, RunningRecordsController } from "./controller";
import { SearchRunningRecordsInterceptor } from "./interceptor";

@Module({
    imports: [
        TypeOrmModule.forFeature([RunningRecord]),
    ],
    providers: [
        RunningRecordsService,
        RunningDashboardsService,
        ContainsPathService,
        GenerateArtUrlService,
        SearchRunningRecordsInterceptor,
    ],
    controllers: [
        RunningRecordsController,
        RunningDashboardsController,
    ],
    exports: [RunningDashboardsService],
})
export class RunningModule {}
