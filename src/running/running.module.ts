import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RunningRecord } from "../modules/running";
import { RunningStatisticsService, RunningRecordsService } from "./service";
import {
  RunningRecordsController,
  RunningStatisticsController,
} from "./controller";

@Module({
  imports: [TypeOrmModule.forFeature([RunningRecord])],
  providers: [RunningRecordsService, RunningStatisticsService],
  controllers: [RunningRecordsController, RunningStatisticsController],
})
export class RunningModule {}
