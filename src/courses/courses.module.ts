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

const __EXTERNAL_PROVIDERS = [RunningDashboardsService];

@Module({
  imports: [
      TypeOrmModule.forFeature([
          Course,
          CourseNode,
          CourseBookmark,
          RunningRecord,
      ]),
      forwardRef(() => RunningModule)
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
