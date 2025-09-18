import { Module } from '@nestjs/common';
import {
    CourseBookmarksService, CourseNodesService,
    CoursesService, GetRecentPaceService, InspectPathService,
    SearchCoursesService
} from './service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Course, CourseBookmark, CourseNode } from "../modules/courses";
import { CoursesController, SearchCoursesController } from "./controller";
import { SearchCoursesInterceptor, SearchCoursesResponseInterceptor } from "./interceptor";

@Module({
  imports: [
      TypeOrmModule.forFeature([
          Course,
          CourseNode,
          CourseBookmark,
      ]),
  ],
  providers: [
      CoursesService,
      CourseNodesService,
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
