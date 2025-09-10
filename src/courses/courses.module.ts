import { forwardRef, Module } from '@nestjs/common';
import {
    CourseBookmarksService,
    CoursesService, GetRecentPaceService, InspectPathService,
    SearchCoursesService
} from './service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Course, CourseBookmark, CourseNode } from "../modules/courses";
import { CoursesController } from "./controller";
import { RunningRecord } from "../modules/running";
import { RunningDashboardsService } from "../running/service";
import { RunningModule } from "../running/running.module";
import { WorkerPoolModule, WorkerPoolService } from "../config/workerpool";
import { resolve } from "node:path";

const __EXTERNAL_PROVIDERS = [
    WorkerPoolService,
    RunningDashboardsService
];

@Module({
  imports: [
      TypeOrmModule.forFeature([
          Course,
          CourseNode,
          CourseBookmark,
          RunningRecord,
      ]),
      WorkerPoolModule.register(resolve(__dirname, "/worker/inspect.path.worker.js")),
      forwardRef(() => RunningModule),
  ],
  providers: [
      ...__EXTERNAL_PROVIDERS,
      CoursesService,
      CourseBookmarksService,
      SearchCoursesService,
      GetRecentPaceService,
      InspectPathService,
  ],
  controllers: [CoursesController],
})
export class CoursesModule {}
