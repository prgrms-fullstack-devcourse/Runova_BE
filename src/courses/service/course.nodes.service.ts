import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CourseNode } from "../../modules/courses";
import { Repository } from "typeorm";
import { Transactional } from "typeorm-transactional";
import { CourseNodeDTO } from "../dto";

@Injectable()
export class CourseNodesService {

    constructor(
        @InjectRepository(CourseNode)
        private readonly nodesRepo: Repository<CourseNode>,
    ) {}

    @Transactional()
    async createCourseNodes(
        courseId: number,
        nodes: CourseNodeDTO[],
    ): Promise<void> {
        await this.nodesRepo.insert(
            nodes.map(node =>
                ({ courseId, ...node })
            ),
        );
    }
}