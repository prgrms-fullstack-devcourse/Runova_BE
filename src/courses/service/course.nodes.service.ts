import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CourseNode } from "../../modules/courses";
import { Repository } from "typeorm";
import { CreateCourseNodesDTO } from "../dto";
import { Transactional } from "typeorm-transactional";

@Injectable()
export class CourseNodesService {

    constructor(
        @InjectRepository(CourseNode)
        private readonly nodesRepo: Repository<CourseNode>,
    ) {}

    @Transactional()
    async createCourseNodes(dto: CreateCourseNodesDTO): Promise<void> {
        const { courseId, locations, progresses, bearings } = dto;

        await this.nodesRepo
            .createQueryBuilder()
            .insert()
            .into(CourseNode)
            .values(
                Array.from({ length: locations.length })
                    .map((_, i) => ({
                        courseId,
                        location: locations[i],
                        progress: progresses[i],
                        bearing: bearings[i],
                    }))
            )
            .updateEntity(false)
            .execute();
    }

}