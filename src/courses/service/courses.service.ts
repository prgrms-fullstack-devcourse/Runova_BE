import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Transactional } from "typeorm-transactional";
import { Course, CourseNode } from "../../modules/courses";
import { CourseTopologyDTO, CreateCourseDTO, UpdateCourseDTO } from "../dto";
import { InspectPathService } from "./inspect.path.service";
import { pick } from "../../utils/object";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CoursesService {
    private readonly courseRadius: number;

    constructor(
        @InjectRepository(Course)
        private readonly coursesRepo: Repository<Course>,
        @InjectRepository(CourseNode)
        private readonly nodesRepo: Repository<CourseNode>,
        @Inject(InspectPathService)
        private readonly inspectPathService: InspectPathService,
        @Inject(ConfigService)
        config: ConfigService,
    ) {
        this.courseRadius = config.get<number>("COURSE_RADIUS") ?? 6;
    }

    @Transactional()
    async createCourse(dto: CreateCourseDTO): Promise<void> {
        const { path, ...rest } = dto;

        const { wkt5179, nodes } = await this.inspectPathService
            .inspectPath(path);

        const result = await this.coursesRepo
            .createQueryBuilder()
            .insert()
            .into(Course)
            .values({
                ...rest,
                length: nodes.at(-1)!.progress,
                departure: nodes[0].location,
                shape: () => `  
                        ST_Transform(ST_Buffer(ST_GeomFromText(:wkt), :radius), 4326)  
                `,
            })
            .setParameters({ wkt: wkt5179, radius: this.courseRadius })
            .updateEntity(false)
            .returning("id")
            .execute();

        const courseId: number = result.generatedMaps[0].id;

        await this.nodesRepo.insert(
            nodes.map(node =>
                ({ courseId, ...node })
            )
        );
    }

    async getCourseTopology(id: number): Promise<CourseTopologyDTO> {

        const course = await this.coursesRepo.findOne({
            select: ["shape", "nodes"],
            where: { id },
            relations: { nodes: true }
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

