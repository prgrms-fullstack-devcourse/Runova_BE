import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { RunningRecord } from "../modules/running";
import {
    GenerateArtUrlService,
    RandomArtUrlService,
    RunningDashboardsService,
    RunningRecordsService
} from "./service";
import { RandomArtUrlController, RunningDashboardsController, RunningRecordsController } from "./controller";
import { SearchRunningRecordsInterceptor } from "./interceptor";

@Module({
    imports: [
        TypeOrmModule.forFeature([RunningRecord]),
    ],
    providers: [
        RunningRecordsService,
        RunningDashboardsService,
        GenerateArtUrlService,
        RandomArtUrlService,
        SearchRunningRecordsInterceptor,
    ],
    controllers: [
        RunningRecordsController,
        RunningDashboardsController,
        RandomArtUrlController,
    ],
    exports: [RunningDashboardsService],
})
export class RunningModule {}
