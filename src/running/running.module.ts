import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { RunningRecord } from "../modules/running";
import { RunningRecordsService } from "./service";
import { RunningRecordsController } from "./controller";

@Module({
    imports: [TypeOrmModule.forFeature([RunningRecord])],
    providers: [
        RunningRecordsService
    ],
    controllers: [
        RunningRecordsController
    ]
})
export class RunningModule {}
