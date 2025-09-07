import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Transactional } from "typeorm-transactional";
import { Course } from "../../modules/courses";
import { CourseTopologyDTO, CreateCourseDTO, UpdateCourseDTO } from "../dto";
import { pick } from "../../utils/object";
import { RunningRecord } from "../../modules/running";
import { InsertCourseService } from "./insert.course.service";

@Injectable()
export class CoursesService {
    private readonly courseRadius: number;

    constructor(
        @InjectRepository(Course)
        private readonly coursesRepo: Repository<Course>,
        @InjectRepository(RunningRecord)
        private readonly recordsRepo: Repository<RunningRecord>,
        @Inject(InsertCourseService)
        private readonly insertCourseService: InsertCourseService,
    ) {}

    @Transactional()
    async createCourse(dto: CreateCourseDTO): Promise<void> {
        const { runningId, ...values } = dto;

        if (runningId) {

        }
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

