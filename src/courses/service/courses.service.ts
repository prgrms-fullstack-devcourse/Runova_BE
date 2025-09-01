import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Coordinates } from "../../common/geo";
import { Transactional } from "typeorm-transactional";
import { EstimateTimeService } from "./estimate.time.service";
import { Course } from "../../modules/courses";
import { InspectPathService } from "./inspect.path.service";
import { CourseNodesService } from "./course.nodes.service";

@Injectable()
export class CoursesService {

    constructor(
        @InjectRepository(Course)
        private readonly coursesRepo: Repository<Course>,
        @Inject(InspectPathService)
        private readonly inspectPathService: InspectPathService,
        @Inject(EstimateTimeService)
        private readonly timeService: EstimateTimeService,
        @Inject(CourseNodesService)
        private readonly nodesService: CourseNodesService,
    ) {}

    @Transactional()
    async createCourse(userId: number, path: Coordinates[]): Promise<void> {
        const { length, nodes } = await this.inspectPathService.inspect(path);
        const time = this.timeService.estimateTime(length);
        const departure = nodes[0].location;

        const result = await this.coursesRepo
            .createQueryBuilder()
            .insert()
            .into(Course)
            .values({ userId, length, time, departure })
            .updateEntity(false)
            .returning("id")
            .execute();

        const id: number = result.generatedMaps[0].id;
        await this.nodesService.createCourseNodes(id, nodes);
    }

    @Transactional()
    async deleteCourse(id: number, userId: number): Promise<void> {
        await this.coursesRepo.delete({ id, userId, });
    }
}
