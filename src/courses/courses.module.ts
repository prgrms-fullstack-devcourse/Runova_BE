import { Module } from '@nestjs/common';
import { CoursesService, EstimateTimeService, InspectPathService, SearchCoursesService } from './service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Course, CourseNode } from "../modules/courses";
import { CoursesController } from "./courses.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseNode])],
  providers: [
      CoursesService,
      SearchCoursesService,
      InspectPathService,
      EstimateTimeService,
  ],
  controllers: [CoursesController],
})
export class CoursesModule {}
