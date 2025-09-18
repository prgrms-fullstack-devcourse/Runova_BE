import { Injectable, Logger } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { Course, CourseBookmark } from "../../modules/courses";
import { DataSource, Repository, SelectQueryBuilder } from "typeorm";
import { CourseDTO, SearchAdjacentCoursesDTO, SearchCoursesDTO } from "../dto";
import { setSelect, setSelectBookmarked } from "./search.courses.service.internal";
import { RunningRecord } from "../../modules/running";

@Injectable()
export class SearchCoursesService {

    constructor(
        @InjectRepository(Course)
        private readonly coursesRepo: Repository<Course>,
        @InjectRepository(CourseBookmark)
        private readonly bookmarksRepo: Repository<CourseBookmark>,
        @InjectDataSource()
        private readonly ds: DataSource,
    ) {}

    async searchUserCourses(dto: SearchCoursesDTO): Promise<CourseDTO[]> {
        const { userId, pace, paging } = dto;

        const qb: SelectQueryBuilder<Course>
            = this.coursesRepo.createQueryBuilder("course");

        setSelect(qb, pace)
            .addSelect(`NULL`, "bookmarked")
            .addSelect('NULL', "distance");

        qb.where("course.userId = :userId", { userId });
        paging?.cursor && qb.andWhere(`course.id < :id`, paging.cursor);

        qb.orderBy(`course.id`, "DESC");
        qb.take(paging?.limit ?? 10);

        return qb.getRawMany<CourseDTO>();
    }

    async searchBookmarkedCourses(dto: SearchCoursesDTO) {
        const { userId, pace, paging } = dto;

        const qb: SelectQueryBuilder<CourseBookmark> = this.bookmarksRepo
            .createQueryBuilder("bookmark")
            .innerJoin(Course, "course", "course.id = bookmark.courseId");

        setSelect(qb, pace);
        qb.addSelect(`true`, "bookmarked");
        qb.where("bookmark.userId = :userId", { userId });
        paging?.cursor && qb.andWhere(`course.id < :id`, paging.cursor);
        qb.orderBy(`course.id`, "DESC");
        qb.take(paging?.limit ?? 10);

        return qb.getRawMany<CourseDTO>();
    }

    async searchCompletedCourses(dto: SearchCoursesDTO): Promise<CourseDTO[]> {
        const { userId, pace, paging } = dto;

        const qb = this.ds
            .createQueryBuilder()
            .from(RunningRecord, "record")
            .innerJoin(`record.course`, "course")
            .where(`record.userId = :userId`, { userId })
            .andWhere(`record.courseId IS NOT NULL`);

        setSelect(qb, pace);
        setSelectBookmarked(qb, userId);
        paging?.cursor && qb.andWhere(`course.id < :id`, paging.cursor);
        qb.orderBy(`course.id`, "DESC");
        qb.take(paging?.limit ?? 10);

        return qb.getRawMany<CourseDTO>();
    }

    async searchAdjacentCourses(
        dto: SearchAdjacentCoursesDTO
    ): Promise<CourseDTO[]> {
        const { userId, pace, location, radius, paging } = dto;

        const qb: SelectQueryBuilder<Course> = this.coursesRepo
            .createQueryBuilder("course");

        setSelect(qb, pace);
        setSelectBookmarked(qb, userId);

        const locExpr = `ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)`;
        const distExpr = `course.departure::geography <-> ${locExpr}::geography`;

        qb.addSelect(distExpr, "distance")
            .setParameters({ lon: location[0], lat: location[1] });

        qb.where(`ST_DWithin(course.departure, ${locExpr}, :radius)`, { radius });

        if (paging?.cursor) {
            qb.andWhere(
                `(${distExpr}) > :distance OR ((${distExpr}) = :distance AND course.id < :id)`,
                paging.cursor,
            );
        }

        qb.orderBy(`distance`, "ASC");
        qb.addOrderBy(`course.id`, "DESC");
        qb.take(paging?.limit ?? 10);

        const result = await qb.getRawMany<CourseDTO>();
        Logger.debug(result, SearchCoursesService.name);
        return result;
    }

    async searchCachedCourses(
        courses: CourseDTO[],
        userId: number,
    ): Promise<CourseDTO[]> {
        if (!courses.length) return courses;

        const bookmarks = await this.bookmarksRepo
            .createQueryBuilder("bookmark")
            .select(`bookmark.courseId`, "courseId")
            .where(
                `bookmark.courseId IN (:...ids)`,
                { ids: courses.map(c => c.id) }
            )
            .andWhere(`bookmark.userId = :userId`, { userId })
            .getRawMany<Pick<CourseBookmark, "courseId">>();

        const ids = new Set<number>(bookmarks.map(b => b.courseId));

        for (const course of courses)
            course.bookmarked = ids.has(course.id);

        return courses;
    }

}

