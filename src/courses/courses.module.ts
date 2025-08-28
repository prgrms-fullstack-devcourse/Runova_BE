import { Module } from '@nestjs/common';
import { CoursesService, EstimateHoursService, InspectPathService, SearchCoursesService } from './service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Course, CourseNode } from "../modules/courses";
import { CoursesController } from "./courses.controller";
import { CourseNodesService } from "./service/course.nodes.service";

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseNode])],
  providers: [
      CoursesService,
      SearchCoursesService,
      InspectPathService,
      EstimateHoursService,
      CourseNodesService,
  ],
  controllers: [CoursesController],
})
export class CoursesModule {}
