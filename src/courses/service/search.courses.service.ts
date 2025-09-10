import { Injectable } from "@nestjs/common";
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
        qb.addSelect('NULL', "distance");

        qb.where("course.userId = :userId", { userId });
        paging?.cursor && qb.andWhere("course.id < :lastId", paging.cursor);

        qb.take(paging?.limit);
        qb.orderBy(`course.id`, "DESC");

        return qb.getRawMany<CourseDTO>();
    }

    async searchBookmarkedCourses(dto: SearchCoursesDTO): Promise<CourseDTO[]> {
        const { userId, pace, paging } = dto;

        const qb: SelectQueryBuilder<CourseBookmark> = this.bookmarksRepo
            .createQueryBuilder("bookmark")
            .innerJoin(Course, "course", "course.id = bookmark.courseId");

        setSelect(qb, pace);
        qb.addSelect(`true`, "bookmarked");
        qb.where("bookmark.userId = :userId", { userId });
        paging?.cursor && qb.andWhere("course.id < :lastId", paging.cursor);

        qb.take(paging?.limit);
        qb.orderBy(`course.id`, "DESC");

        return qb.getRawMany<CourseDTO>();
    }

    async searchAdjacentCourses(
        dto: SearchAdjacentCoursesDTO
    ): Promise<CourseDTO[]> {
        const { userId, pace, location, radius, paging } = dto;

        const qb: SelectQueryBuilder<Course> = this.coursesRepo
            .createQueryBuilder("course");

        // Build a CTE that exposes the user's point as `loc.geom`
        qb.addCommonTableExpression(
            `
            SELECT ST_SetSRID(ST_MakePoint(:...coords), 4326) AS geom
            `,
            "location"
        )
            .setParameter("coords", location)
            .addFrom("location", "loc");

        // Select columns + bookmark info
        setSelect(qb, pace);
        setSelectBookmarked(qb, userId);

        qb.addSelect(
            `ST_Distance(course.departure::geography, loc.geom::geography)`,
            "distance"
        );

        // KNN order expression (meters) and precise payload distance
        const ordExpr = `course.departure::geography <-> loc.geom::geography`;
        qb.addSelect(ordExpr, "__ord");

        // Use geography for meter-based radius filtering (index-assisted)
        qb.where(
            `ST_DWithin(course.departure::geography, loc.geom::geography, :radius)`,
            { radius }
        );

        if (paging?.cursor) {

          qb.andWhere(
              `(${ordExpr}) > :lastDist OR ((${ordExpr}) = :lastDist AND course.id > :lastId)`,
              paging.cursor,
          );
        }

        qb.orderBy(`__ord`, "ASC")
          .addOrderBy(`course.id`, "ASC");
        qb.take(paging?.limit);

        return qb.getRawMany<CourseDTO>();
    }



}

