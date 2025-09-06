import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Transactional } from "typeorm-transactional";
import { Course, CourseNode } from "../../modules/courses";
import { CreateCourseDTO } from "../dto";
import { MakeCourseNodesService } from "./make.course.nodes.service";
import { Line } from "../../common/geometry";

@Injectable()
export class CoursesService {

    constructor(
        @InjectRepository(Course)
        private readonly coursesRepo: Repository<Course>,
        @Inject(MakeCourseNodesService)
        private readonly makeCourseNodesService: MakeCourseNodesService,
    ) {}

    @Transactional()
    async createCourse(dto: CreateCourseDTO): Promise<void> {
        const { path, ...rest } = dto;

        const nodes: CourseNode[] = await this.makeCourseNodesService
            .makeCourseNodes(path);

        await this.coursesRepo
            .createQueryBuilder()
            .insert()
            .into(Course)
            .values({
                ...rest,
                nodes,
                length: nodes.at(-1)!.progress,
                departure: nodes[0].location,
                shape: () => `
                ST_Transform(ST_Buffer(ST_Transform(ST_SetSRID(ST_GeomFromText(:wkt), 4326), 5179), 6), 4326)
                `
            })
            .setParameter("wkt", __makeWkt(path))
            .updateEntity(false)
            .execute();
    }

    @Transactional()
    async deleteCourse(id: number, userId: number): Promise<void> {
        await this.coursesRepo.delete({ id, userId, });
    }
}

function __makeWkt(path: Line): string {

    const inner = path.map(pos => pos.join(' '))
        .join(',');

    return `LINESTRING (${inner})`;
}
