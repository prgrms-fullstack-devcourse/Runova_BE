import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Course } from "../../modules/courses";

@Injectable()
export class ContainsPathService {

    constructor(
       @InjectDataSource()
       private readonly ds: DataSource,
    ) {}

    // course의 shape가 path를 완전히 표함하면 완주한 것으로 판단한다.
    async containsPath(
        courseId: number,
        path: [number, number][],
    ): Promise<boolean> {

        const result = await this.ds
            .createQueryBuilder()
            .select(
                `
                ST_Contains(
                    course.shape,                
                    ST_SetSRID(ST_GeomFromGeoJSON(:geometry), 4326)
                )
                `,
                "containsPath"
            )
            .from(Course, "course")
            .where(`course.id = :id`)
            .setParameters({
                id: courseId,
                geometry: {
                    type: "LineString",
                    coordinates: path,
                },
            })
            .getRawOne<{ containsPath: boolean; }>();

        Logger.debug(result, ContainsPathService.name);
        if (!result) throw new NotFoundException();
        return result.containsPath;
    }

}