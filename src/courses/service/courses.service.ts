import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Transactional } from "typeorm-transactional";
import { Course } from "../../modules/courses";
import { InspectPathService } from "./inspect.path.service";
import { CourseNodesService } from "./course.nodes.service";
import { CreateCourseDTO } from "../dto";

@Injectable()
export class CoursesService {

    constructor(
        @InjectRepository(Course)
        private readonly coursesRepo: Repository<Course>,
        @Inject(InspectPathService)
        private readonly inspectPathService: InspectPathService,
        @Inject(CourseNodesService)
        private readonly nodesService: CourseNodesService,
    ) {}

    @Transactional()
    async createCourse(dto: CreateCourseDTO): Promise<void> {

        const result = await this.coursesRepo
            .createQueryBuilder()
            .insert()
            .into(Course)
            .values({
                ...dto,
                departure: dto.path[0],

            })
            .execute();

        const id: number = result.generatedMaps[0].id;
    }

    @Transactional()
    async deleteCourse(id: number, userId: number): Promise<void> {
        await this.coursesRepo.delete({ id, userId, });
    }


}
