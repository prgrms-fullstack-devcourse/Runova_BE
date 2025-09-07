import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Course, CourseNode } from "../../modules/courses";
import { Repository } from "typeorm";
import { InspectPathService } from "./inspect.path.service";
import { ConfigService } from "@nestjs/config";
import { Transactional } from "typeorm-transactional";
import { InsertCourseDTO } from "../dto";

@Injectable()
export class InsertCourseService {
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

    // 생성된 course의 id값 반환
    @Transactional()
    async insertCourse(dto: InsertCourseDTO): Promise<number> {
        const { path, ...rest } = dto;

        const { wkt5179, nodes } = await this.inspectPathService
            .makeCourseNodes(path);

        const result = await this.coursesRepo
            .createQueryBuilder()
            .insert()
            .into(Course)
            .values({
                ...rest,
                length: nodes.at(-1)!.progress,
                departure: nodes[0].location,
                shape: () => `
                ST_Transform(
                    ST_Buffer(ST_GeomFromText(:wkt), :radius),
                    4326
                )
                `
            })
            .setParameters({ wkt: wkt5179, radius: this.courseRadius })
            .updateEntity(false)
            .returning("id")
            .execute();

        const id: number = result.generatedMaps[0].id;

        await this.nodesRepo.insert(
            nodes.map(node =>
                ({ courseId: id, ...node })
            )
        );

        return id;
    }
}