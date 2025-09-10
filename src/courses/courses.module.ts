import { forwardRef, Module } from '@nestjs/common';
import {
    CourseBookmarksService,
    CoursesService, GetRecentPaceService, InspectPathService,
    SearchCoursesService
} from './service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Course, CourseBookmark, CourseNode } from "../modules/courses";
import { CoursesController } from "./controller";
import { SearchCoursesInterceptor } from "./interceptor";

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
  ],
  controllers: [CoursesController],
})
export class CoursesModule {}
