import { SelectQueryBuilder } from "typeorm";
import { CourseBookmark } from "../../modules/courses";
import { PagingOptions } from "../../common/paging";

// --ToDo nCompleted 로직 구현
export function setSelect<E extends object>(
    qb: SelectQueryBuilder<E>,
    pace: number,
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
            .addSelect(`course.length / :pace`, "time")
            .setParameter("pace", pace)
            .addSelect("0", "nCompleted");
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

export function setPagingOptions<E extends object>(
    qb: SelectQueryBuilder<E>,
    options: PagingOptions,
): SelectQueryBuilder<E> {
    options.cursor && qb.andWhere("course.id > :cursor", { cursor: options.cursor });
    qb.limit(options.limit ?? 10);
    return qb;
}

