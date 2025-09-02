import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Course, CourseBookmark } from "../../modules/courses";
import { Repository, SelectQueryBuilder } from "typeorm";
import { AdjacentCourseDTO, CourseDTO, SearchAdjacentCoursesDTO } from "../dto";
import { plainsToInstancesOrReject } from "../../utils";
import { PagingOptions } from "../../common/paging";

@Injectable()
export class SearchCoursesService {

    constructor(
        @InjectRepository(Course)
        private readonly coursesRepo: Repository<Course>,
        @InjectRepository(CourseBookmark)
        private readonly bookmarksRepo: Repository<CourseBookmark>,
    ) {}

    async searchUserCourses(
        userId: number,
        options?: PagingOptions,
    ): Promise<CourseDTO[]> {

        const qb = __setSelect(
            this.coursesRepo
                .createQueryBuilder("course")
        );

        __setSelectBookmarked(qb)
            .where("course.userId = :userId", { userId });

        __setPagingOptions(qb, options ?? {});

        const raws = await qb.getRawMany();
        return plainsToInstancesOrReject(CourseDTO, raws);
    }

    async searchBookmarkedCourses(
        userId: number,
        options?: PagingOptions,
    ): Promise<CourseDTO[]> {

        const qb = this.bookmarksRepo
            .createQueryBuilder("bookmark")
            .innerJoin(Course, "course", "course.id = bookmark.courseId");

        __setSelect(qb).addSelect("bookmarked", "true");
        qb.where("bookmark.userId = :userId", { userId });

        __setPagingOptions(qb, options ?? {});

        const raws = await qb.getRawMany();
        return plainsToInstancesOrReject(CourseDTO, raws);
    }

    async searchAdjacentCourses(
        dto: SearchAdjacentCoursesDTO
    ): Promise<AdjacentCourseDTO[]> {
        const { userId, location, radius, ...pagingOptions } = dto;

        const qb = this.coursesRepo
            .createQueryBuilder("course")
            .addCommonTableExpression(
                `
                SELECT ST_SetSRID(ST_MakePoint(:lon, :lat), 4326) AS geom
                `,
                "location"
            )
            .addFrom("location", "loc");

        __setSelectBookmarked(__setSelect(qb))
            .addSelect(
                `
                ST_DistanceSphere(course.departure, loc.geom) / 1000`,
                "distance"
            )
            .where(`ST_DWithin(course.departure, loc.geom, :radius)`)
            .setParameters({ userId, ...location, radius: radius * 1000 });

       __setPagingOptions(qb, pagingOptions);
       qb.orderBy("distance", "ASC");


        const raws = await qb.getRawMany();
        return plainsToInstancesOrReject(AdjacentCourseDTO, raws);
    }
}

function __setSelect<E extends object>(
    qb: SelectQueryBuilder<E>,
): SelectQueryBuilder<E> {
    return qb
        .select("course.id", "id")
        .addSelect(
            `
                jsonb_build_object(
                    'lon', ST_X(course.departure),
                    'lat', ST_Y(course.departure),
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
        .addSelect("course.nCompleted", "nCompleted");
}

function __setSelectBookmarked<E extends object>(
    qb: SelectQueryBuilder<E>
): SelectQueryBuilder<E> {
    return qb.addSelect(
        `
            EXISTS(${
            qb.subQuery()
                .select("1")
                .from(CourseBookmark, "bookmark")
                .where("bookmark.courseId = course.id")
                .andWhere("bookmark.userId = :userId")
        })
            `,
        "bookmarked"
    );
}

function __setPagingOptions<E extends object>(
    qb: SelectQueryBuilder<E>,
    options: PagingOptions,
): SelectQueryBuilder<E> {
    options.cursor && qb.andWhere("course.id > :cursor", { cursor: options.cursor });
    qb.limit(options.limit ?? 10);
    return qb;
}

