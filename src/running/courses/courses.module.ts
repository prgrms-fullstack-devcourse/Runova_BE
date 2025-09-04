import { forwardRef, Module } from '@nestjs/common';
import {
    CourseBookmarksService,
    CourseNodesService,
    CoursesService, GetMeanPaceService,
    InspectPathService,
    SearchCoursesService
} from '../service/courses';
import { TypeOrmModule } from "@nestjs/typeorm";
import { CompletedCourse, Course, CourseBookmark, CourseNode } from "../../modules/running";
import { RunningCoursesController } from "./controller";
import { RunningRecord } from "../../modules/running";
import { RunningStatisticsService } from "../service/records";
import { RecordsModule } from "../records/records.module";

const __EXTERNAL_PROVIDERS = [RunningStatisticsService];

@Module({
  imports: [
      TypeOrmModule.forFeature([
          Course,
          CourseNode,
          CourseBookmark,
          CompletedCourse,
          RunningRecord
      ]),
      forwardRef(() => RecordsModule)
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
  controllers: [RunningCoursesController],
})
export class CoursesModule {}
