import { forwardRef, Module } from '@nestjs/common';
import {
    CourseBookmarksService,
    CoursesService, GetMeanPaceService,
    SearchCoursesService
} from './service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { CompletedCourse, Course, CourseBookmark, CourseNode } from "../modules/courses";
import { CoursesController } from "./controller";
import { RunningRecord } from "../modules/running";
import { RunningStatisticsService } from "../running/service";
import { RunningModule } from "../running/running.module";
import { CompletedCoursesService } from "./service/completed.courses.service";
import { InspectRunningRecordService } from "./service/inspect.running.record.service";

const __EXTERNAL_PROVIDERS = [RunningStatisticsService];

@Module({
  imports: [
      TypeOrmModule.forFeature([
          Course,
          CourseNode,
          CourseBookmark,
          CompletedCourse,
          RunningRecord,
      ]),
      forwardRef(() => RunningModule)
  ],
  providers: [
      ...__EXTERNAL_PROVIDERS,
      CoursesService,
      CourseBookmarksService,
      CompletedCoursesService,
      SearchCoursesService,
      InspectRunningRecordService,
      GetMeanPaceService,
  ],
  controllers: [CoursesController],
  exports: [CompletedCoursesService, InspectRunningRecordService],
})
export class CoursesModule {}
