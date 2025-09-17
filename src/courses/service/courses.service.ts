import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Transactional } from "typeorm-transactional";
import { Course } from "../../modules/courses";
import { CourseTopologyDTO, CreateCourseDTO, UpdateCourseDTO } from "../dto";
import { InspectPathService } from "./inspect.path.service";
import { pick } from "../../utils/object";
import { ConfigService } from "@nestjs/config";
import { CourseNodesService } from "./course.nodes.service";

@Injectable()
export class CoursesService {
    private readonly courseRadius: number;

    constructor(
        @InjectRepository(Course)
        private readonly coursesRepo: Repository<Course>,
        @Inject(InspectPathService)
        private readonly inspectPathService: InspectPathService,
        @Inject(CourseNodesService)
        private readonly nodesService: CourseNodesService,
        @Inject(ConfigService)
        config: ConfigService,
    ) {
        this.courseRadius = config.get<number>("COURSE_RADIUS") ?? 12;
    }

    @Transactional()
    async createCourse(dto: CreateCourseDTO): Promise<void> {
        const { path, ...values } = dto;

        const { wkt5179, ...rest } = await this.inspectPathService
            .inspectPath(path);

        const result = await this.coursesRepo
            .createQueryBuilder()
            .insert()
            .into(Course)
            .values({
                ...values,
                length: rest.progresses.at(-1)!,
                departure: path[0],
                shape: () => `  
                        ST_Transform(ST_Buffer(ST_GeomFromText(:wkt)), 4326)  
                `,
            })
            .setParameters({ wkt: wkt5179, radius: this.courseRadius })
            .updateEntity(false)
            .returning("id")
            .execute();

      
        await this.nodesService.createCourseNodes({
            courseId: result.raw[0].id,
            locations: path,
            ...rest,
        })
    }

    async getCourseTopology(id: number): Promise<CourseTopologyDTO> {

        const course = await this.coursesRepo.findOne({
            select: ["id", "shape", "nodes"],
            where: { id },
            relations: { nodes: true },
        });

        if (!course) throw new NotFoundException();

        return {
            shape: course.shape,
            nodes: course.nodes.map(node =>
                pick(node, ["location", "progress", "bearing"])
            ),
        };
    }

    @Transactional()
    async updateCourse(dto: UpdateCourseDTO): Promise<void> {
        const { id, userId, ...values } = dto;
        if (!Object.keys(values).length) return;
        await this.coursesRepo.update({ id, userId }, values);
    }

    @Transactional()
    async deleteCourse(id: number, userId: number): Promise<void> {
        await this.coursesRepo.delete({ id, userId, });
    }
}

