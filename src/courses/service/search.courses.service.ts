import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Course, CourseBookmark } from "../../modules/courses";
import { Repository, SelectQueryBuilder } from "typeorm";
import { CourseDTO, SearchAdjacentCoursesDTO, SearchCoursesDTO } from "../dto";
import { setSelect, setSelectBookmarked } from "./search.courses.service.internal";

@Injectable()
export class SearchCoursesService {

    constructor(
        @InjectRepository(Course)
        private readonly coursesRepo: Repository<Course>,
        @InjectRepository(CourseBookmark)
        private readonly bookmarksRepo: Repository<CourseBookmark>,
    ) {}

    async searchUserCourses(dto: SearchCoursesDTO): Promise<CourseDTO[]> {
        const { userId, pace, paging } = dto;

        const qb: SelectQueryBuilder<Course>
            = this.coursesRepo.createQueryBuilder("course");

        setSelect(qb, pace);
        setSelectBookmarked(qb, userId);
        qb.addSelect('NULL', "distance")
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
}

