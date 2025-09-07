import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Transactional } from "typeorm-transactional";
import { Course, CourseNode } from "../../modules/courses";
import { CourseTopologyDTO, CreateCourseDTO, InsertCourseDTO, UpdateCourseDTO } from "../dto";
import { InspectPathService } from "./inspect.path.service";
import { pick } from "../../utils/object";
import { ConfigService } from "@nestjs/config";
import { RunningRecord } from "../../modules/running";
import { InsertCourseService } from "./insert.course.service";

@Injectable()
export class CoursesService {

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

        if (dto.recordId) {

            const path: [number, number][]
                = await this.getPathFromRunningRecord(dto.recordId, dto.userId);

            const id: number = await this.insertCourseService
                .insertCourse(Object.assign(dto, { path }));

            await this.recordsRepo.update(dto.recordId, { courseId: id });
        }
        else {
            if (!dto.path) throw new BadRequestException();
            await this.insertCourseService.insertCourse(dto as InsertCourseDTO);
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

    private async getPathFromRunningRecord(
        recordId: number,
        userId: number,
    ): Promise<[number, number][]> {

        const record = await this.recordsRepo.findOne({
            select: ["courseId", "path"],
            where: { id: recordId, userId },
        });

        if (!record) throw new NotFoundException();
        if (!record.courseId) throw new ConflictException("course id already set for the record");
        return record.path;
    }

}


