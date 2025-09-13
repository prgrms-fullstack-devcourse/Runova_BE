import { Module } from '@nestjs/common';
import {
    CourseBookmarksService,
    CoursesService, GetRecentPaceService, InspectPathService,
    SearchCoursesService
} from './service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Course, CourseBookmark, CourseNode } from "../modules/courses";
import { CoursesController, SearchCoursesController } from "./controller";
import { SearchCoursesInterceptor, SearchCoursesResponseInterceptor } from "./interceptor";
import { WorkersPoolModule, WorkersPoolService } from "../config/workerpool";
import { resolve } from "node:path";

const __EXTERNAL_PROVIDERS = [WorkersPoolService];

@Module({
  imports: [
      TypeOrmModule.forFeature([
          Course,
          CourseNode,
          CourseBookmark,
      ]),
      WorkersPoolModule.register(
          resolve(__dirname, "worker/inspect.path.worker.js")
      ),
  ],
  providers: [
      ...__EXTERNAL_PROVIDERS,
      CoursesService,
      CourseBookmarksService,
      SearchCoursesService,
      GetRecentPaceService,
      InspectPathService,
      SearchCoursesInterceptor,
      SearchCoursesResponseInterceptor,
  ],
  controllers: [
      CoursesController,
      SearchCoursesController,
  ],
})
export class CoursesModule {}
