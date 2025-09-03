import { forwardRef, Module } from '@nestjs/common';
import {
    CourseBookmarksService,
    CourseNodesService,
    CoursesService, GetMeanPaceService,
    InspectPathService,
    SearchCoursesService
} from './service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Course, CourseBookmark, CourseNode } from "../modules/courses";
import { CoursesController } from "./controller";
import { RunningRecord } from "../modules/running";
import { RunningStatisticsService } from "../running/service";
import { RunningModule } from "../running/running.module";

const __EXTERNAL_PROVIDERS = [RunningStatisticsService];

@Module({
  imports: [
      TypeOrmModule.forFeature([
          Course, CourseNode, CourseBookmark, RunningRecord
      ]),
      forwardRef(() => RunningModule)
  ],
  providers: [
      ...__EXTERNAL_PROVIDERS,
      CoursesService,
      CourseNodesService,
      CourseBookmarksService,
      SearchCoursesService,
      InspectPathService,
      GetMeanPaceService,
  ],
  controllers: [CoursesController],
})
export class CoursesModule {}
