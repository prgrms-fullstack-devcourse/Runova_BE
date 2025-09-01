import { Module } from '@nestjs/common';
import {
    CourseBookmarksService,
    CourseNodesService,
    CoursesService,
    EstimateTimeService,
    InspectPathService,
    SearchCoursesService
} from './service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Course, CourseBookmark, CourseNode } from "../modules/courses";
import { CoursesController } from "./courses.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseNode, CourseBookmark])],
  providers: [
      CoursesService,
      CourseNodesService,
      CourseBookmarksService,
      SearchCoursesService,
      InspectPathService,
      EstimateTimeService,
  ],
  controllers: [CoursesController],
})
export class CoursesModule {}
