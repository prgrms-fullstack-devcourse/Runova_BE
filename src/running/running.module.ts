import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { RunningRecord } from "../modules/running";
import { ContainsPathService, GenerateArtUrlService, RunningDashboardsService, RunningRecordsService } from "./service";
import { RunningDashboardsController, RunningRecordsController } from "./controller";
import { SearchRunningRecordsInterceptor } from "./interceptor";
import { FilesModule } from "../files/files.module";
import { FilesService } from "../files/files.service";

const __EXTERNAL_PROVIDERS = [FilesService];

@Module({
    imports: [
        TypeOrmModule.forFeature([RunningRecord]),
        FilesModule,
    ],
    providers: [
        ...__EXTERNAL_PROVIDERS,
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
