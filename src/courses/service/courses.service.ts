import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CourseDTO, CourseNodeDTO, GetCoursesDTO } from "../dto";
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

        const id = await this.insertCourse(userId, length, time);
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

    async getCourses(dto: GetCoursesDTO): Promise<CourseDTO[]> {
        const { ids, userId } = dto;

        const courses = await this.coursesRepo.findBy({
            id: ids?.length && In(ids),
            userId,
        });

        return courses.map(__toDTO);
    }

    @Transactional()
    async deleteCourse(id: number, userId: number): Promise<void> {
        await this.coursesRepo.delete({ id, userId, });
    }

    private async insertCourse(userId: number, length: number, time: number): Promise<number> {

        const result = await this.coursesRepo
            .createQueryBuilder()
            .insert()
            .into(Course)
            .values({ userId, length, time })
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
        ...pick(course, ["id", "length", "nCompleted"]),
        nodes,
        timeRequired
    };
}
