import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CourseDTO, CourseNodeDTO } from "../dto";
import { Coordinates } from "../../common/geo";
import { Transactional } from "typeorm-transactional";
import { EstimateTimeService } from "./estimate.time.service";
import { pick } from "../../utils/object";
import { Course, CourseNode } from "../../modules/courses";
import { InspectPathService } from "./inspect.path.service";
import { DateTimeFormatter, nativeJs } from "@js-joda/core";

@Injectable()
export class CoursesService {

    constructor(
        @InjectRepository(Course)
        private readonly coursesRepo: Repository<Course>,
        @InjectRepository(CourseNode)
        private readonly nodesRepo: Repository<CourseNode>,
        @Inject(InspectPathService)
        private readonly inspectPathService: InspectPathService,
        @Inject(EstimateTimeService)
        private readonly timeService: EstimateTimeService,
    ) {}

    @Transactional()
    async createCourse(userId: number, path: Coordinates[]): Promise<void> {
        const { length, nodes } = await this.inspectPathService.inspect(path);
        const time = this.timeService.estimateTime(length);

        const id = await this.insertCourse(
            userId, length, time,
            nodes[0].location
        );

        await this.insertNodes(id, nodes);
    }

    async getCourse(id: number): Promise<CourseDTO> {

        const course = await this.coursesRepo
            .findOne({
                relations: { nodes: true },
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

    private async insertCourse(
        userId: number,
        length: number,
        time: number,
        departure: Coordinates,
    ): Promise<number> {

        const result = await this.coursesRepo
            .createQueryBuilder()
            .insert()
            .into(Course)
            .values({ userId, length, time, departure })
            .updateEntity(false)
            .returning("id")
            .execute();

        return result.generatedMaps[0].id;
    }


    private async insertNodes(id: number, nodes: CourseNodeDTO[]): Promise<void> {
        await this.nodesRepo.insert(
            nodes.map(node =>
                ({ courseId: id, ...node, })
            )
        );
    }

}

const __formatter: DateTimeFormatter =  DateTimeFormatter.ofPattern("HH:mm:ss");

function __toDTO(course: Course): CourseDTO {

    const nodes: CourseNodeDTO[] = course.nodes.map(n =>
        pick(n, ["location", "progress", "bearing"])
    );

    const timeRequired = nativeJs(new Date(course.time))
        .format(__formatter);

    return {
        ...pick(course, ["id", "departure", "length", "nCompleted"]),
        nodes,
        timeRequired
    };
}
