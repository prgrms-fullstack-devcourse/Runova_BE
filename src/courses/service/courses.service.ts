import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CourseDTO, CourseNodeDTO } from "../dto";
import { Location } from "../../common/geo";
import { Transactional } from "typeorm-transactional";
import { EstimateHoursService } from "./estimate.hours.service";
import { pick } from "../../utils/object";
import { Course } from "../../modules/courses";
import { InspectPathService } from "./inspect.path.service";
import { Duration } from "@js-joda/core";
import { CourseNodesService } from "./course.nodes.service";
import { formatDuration } from "../../utils/format-duration";

@Injectable()
export class CoursesService {

    constructor(
        @InjectRepository(Course)
        private readonly coursesRepo: Repository<Course>,
        @Inject(InspectPathService)
        private readonly inspectPathService: InspectPathService,
        @Inject(EstimateHoursService)
        private readonly hoursService: EstimateHoursService,
        @Inject(CourseNodesService)
        private readonly nodesService: CourseNodesService,
    ) {}

    @Transactional()
    async createCourse(userId: number, path: Location[]): Promise<void> {
        const { length, nodes } = await this.inspectPathService.inspect(path);
        const hours = this.hoursService.estimate(length);

        const result = await this.coursesRepo
            .createQueryBuilder()
            .insert()
            .into(Course)
            .values({
                userId, length, hours, path,
                head: nodes[0].coordinates
            })
            .updateEntity(false)
            .returning("id")
            .execute();

        const id: number = result.generatedMaps[0].id;
        await this.nodesService.createCourseNodes(id, nodes);
    }

    async getCourse(id: number): Promise<CourseDTO> {

        const course = await this.coursesRepo
            .findOne({
                relations: { nodes: true },
                select: ["id", "length", "hours", "nCompleted", "nodes"],
                where: { id },
                cache: true,
            });

        if (!course) throw new NotFoundException();
        return __toDTO(course);
    }

    @Transactional()
    async deleteCourse(id: number, userId: number): Promise<void> {
        await this.coursesRepo.delete({ id, userId, });
    }
}

function __toDTO(course: Course): CourseDTO {

    const nodes: CourseNodeDTO[] = course.nodes.map(n =>
        pick(n, ["coordinates", "progress", "bearing"])
    );

    const timeRequired = formatDuration(
        Duration.ofHours(course.hours)
    );

    return {
        ...pick(course, ["id", "head", "length", "nCompleted"]),
        nodes,
        timeRequired
    };
}
