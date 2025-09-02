import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CourseNode } from "../../modules/courses";
import { Repository } from "typeorm";
import { CourseNodeDTO } from "../dto";
import { Transactional } from "typeorm-transactional";
import { pick } from "../../utils/object";

@Injectable()
export class CourseNodesService {

    constructor(
        @InjectRepository(CourseNode)
        private readonly nodesRepo: Repository<CourseNode>,
    ) {}

    @Transactional()
    async createCourseNodes(courseId: number, nodes: CourseNodeDTO[]): Promise<void> {
        await this.nodesRepo.insert(
            nodes.map(node =>
                ({ courseId, ...node, })
            )
        );
    }

    async getCourseNodes(courseId: number): Promise<CourseNodeDTO[]> {

        const nodes = await this.nodesRepo.find({
            where: { courseId },
            cache: true,
        });

        // 각 경로는 최소 3개의 노드를 가지기 때문에, 아래가 성립한다.
        if (!nodes.length) throw new NotFoundException();

        return nodes.map(node =>
            pick(node, ["location", "progress", "bearing"])
        );
    }
}

