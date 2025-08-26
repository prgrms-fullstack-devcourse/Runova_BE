import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Course } from "../../modules/courses";
import { Repository, SelectQueryBuilder } from "typeorm";
import { SearchAdjacentCourseResult, SearchAdjacentCoursesDTO, SearchCourseResult, SearchCoursesDTO } from "../dto";
import { addWhere, plainsToInstancesOrReject } from "../../utils";
import { CRS_CODE } from "../../config/proj4";

@Injectable()
export class SearchCoursesService {

    constructor(
        @InjectRepository(Course)
        private readonly coursesRepo: Repository<Course>,
    ) {}

    async searchCourses(dto: SearchCoursesDTO): Promise<SearchCourseResult[]> {
        const qb = this.createSelectQueryBuilder();
        const raws = await __setFilters(qb, dto).getRawMany();
        return plainsToInstancesOrReject(SearchCourseResult, raws);
    }

    async searchAdjacentCourses(
        dto: SearchAdjacentCoursesDTO
    ): Promise<SearchAdjacentCourseResult[]> {
        const { location, radius, ...filters } = dto;

        const qb = this.createSelectQueryBuilder()
            .addCommonTableExpression(
                `
                SELECT 
                    ST_Transform(
                        ST_SetSRID(ST_MakePoint(:lon, :lat), 4326),
                        :code
                    ) AS geom
                `,
                "coordinates"
            )
            .setParameters({ ...location, code: CRS_CODE })
            .addFrom("coordinates", "coord")
            .addSelect(
                `
                ST_Distance(course.head, coord.geom) / 1000`,
                "distance"
            ).where(
                `ST_DWithin(course.head, coord.geom, :radius)`,
                { radius: radius * 1000 }
            );

        const raws = await __setFilters(qb, filters, 1)
            .orderBy("distance", "ASC")
            .getRawMany();

        return plainsToInstancesOrReject(SearchAdjacentCourseResult, raws);
    }


    private createSelectQueryBuilder(): SelectQueryBuilder<Course> {
        return this.coursesRepo
            .createQueryBuilder("course")
            .select("course.id", "id")
            .addSelect(
                `
                jsonb_build_object(
                    'lon', ST_X(ST_StartPoint(course.path)),
                    'lat', ST_Y(ST_StartPoint(course.path))
                )
                `,
                "departure"
            )
            .addSelect("course.length", "length")
            .addSelect(
                `
                to_char(
                    Interval '1 hours' * course.time,
                    'HH24:MI:SS'
                )
                `,
                "timeRequired"
            )
            .addSelect("course.nCompleted", "NCompleted");
    }

}

function __setFilters<E extends  object>(
    qb: SelectQueryBuilder<E>,
    filters: SearchCoursesDTO,
    nWhere: number = 0,
): SelectQueryBuilder<E> {
    const { userId, cursor, limit } = filters;

    if (userId) {
        nWhere = addWhere(
            nWhere,
            qb,
            `course.userId = :userId`,
            { userId }
        );
    }

    if (cursor) {
        addWhere(
            nWhere,
            qb,
            `course.id > :cursor`,
            { cursor },
        );
    }

    qb.limit(limit);
    return qb;
}

