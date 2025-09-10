import { SelectQueryBuilder } from "typeorm";
import { CourseBookmark } from "../../modules/courses";

export function setSelect<E extends object>(
    qb: SelectQueryBuilder<E>,
    pace: number,
): SelectQueryBuilder<E> {
        return qb
            .select("course.id", "id")
            .addSelect("course.title", "title")
            .addSelect("course.imageUrl", "imageUrl")
            .addSelect(
            `ST_AsGeoJSON(course.departure)::jsonb -> 'coordinates'`,
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
                .getQuery()
        })
            `,
        "bookmarked"
    );
}