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
