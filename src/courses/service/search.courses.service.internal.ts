import { SelectQueryBuilder } from "typeorm";
import { CompletedCourse, CourseBookmark } from "../../modules/courses";
import { PagingOptions } from "../../common/query-params";

export function setSelect<E extends object>(
    qb: SelectQueryBuilder<E>,
    pace: number,
    location?: [number, number],
): SelectQueryBuilder<E> {

        qb.select("course.id", "id")
            .addSelect("course.title", "title")
            .addSelect("course.imageUrl", "imageUrl")
            .addSelect(
            `ST_AsGeoJSON(course.departure)::jsonb.coordinates`,
                "departure"
            )
            .addSelect("course.length", "length")
            .addSelect(`course.length / :pace`, "time")
            .setParameter("pace", pace)
            .addSelect("course.createdAt", "createdAt")
            .innerJoin("course.user", "user")
            .addSelect(
                `jsonb_build_object('nickname', user.nickname, 'imageUrl', user.imageUrl)`,
                "author"
            );

        if (location) {
            qb.addCommonTableExpression(
                `SELECT ST_SetSRID(ST_MakePoint(:...coords), 4326) AS geom`,
                "location"
            ).setParameter("coords", location);

            qb.addFrom("location", "loc");

            qb.addSelect(
                `ST_DistanceSphere(course.departure, loc.geom)`,
                "distance"
            );
        }

        return qb;
}

export function setSelectBookmarked<E extends object>(
    qb: SelectQueryBuilder<E>,
    userId: number,
): SelectQueryBuilder<E> {
    return qb.addSelect(
        `
            EXISTS(${
            qb.subQuery()
                .select("1")
                .from(CourseBookmark, "bookmark")
                .where("bookmark.courseId = course.id")
                .andWhere("bookmark.userId = :userId", { userId })
        })
            `,
        "bookmarked"
    );
}

export function setSelectCompleted<E extends object>(
    qb: SelectQueryBuilder<E>,
    userId: number,
): SelectQueryBuilder<E> {
    return qb.addSelect(
        `
            EXISTS(${
            qb.subQuery()
                .select("1")
                .from(CompletedCourse, "cc")
                .where("cc.courseId = course.id")
                .andWhere("cc.userId = :userId", { userId })
        })
            `,
        "completed"
    );
}

export function setPagingOptions<E extends object>(
    qb: SelectQueryBuilder<E>,
    options: PagingOptions,
): SelectQueryBuilder<E> {
    options.cursor && qb.andWhere("course.id > :cursor", { cursor: options.cursor });
    qb.limit(options.limit ?? 10);
    return qb;
}

