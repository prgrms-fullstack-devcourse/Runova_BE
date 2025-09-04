import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Transactional } from "typeorm-transactional";
import { Course } from "../../../modules/running";
import { InspectPathService } from "./inspect.path.service";
import { CourseNodesService } from "./course.nodes.service";
import { CreateCourseDTO } from "../../courses/dto";

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
        const { length, nodes } = await this.inspectPathService.inspect(dto.path);
        const departure = nodes[0].location;
        const { id } = await this.coursesRepo.save({ ...dto, length, departure });
        await this.nodesService.createCourseNodes(id, nodes);
    }

    @Transactional()
    async deleteCourse(id: number, userId: number): Promise<void> {
        await this.coursesRepo.delete({ id, userId, });
    }
}
