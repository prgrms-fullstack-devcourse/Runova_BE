import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Course, CourseBookmark } from "../../modules/courses";
import { Repository, SelectQueryBuilder } from "typeorm";
import { CourseDTO, SearchAdjacentCoursesDTO, SearchCoursesDTO } from "../dto";
import {
    setPagingOptions,
    setSelect,
    setSelectBookmarked,
} from "./search.courses.service.internal";

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
        paging && setPagingOptions(qb, paging);
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
        paging && setPagingOptions(qb, paging);
        qb.orderBy(`course.id`, "DESC");

        return qb.getRawMany<CourseDTO>();
    }



    async searchAdjacentCourses(
        dto: SearchAdjacentCoursesDTO
    ): Promise<CourseDTO[]> {
        const { userId, pace, location, radius } = dto;

        const qb: SelectQueryBuilder<Course> = this.coursesRepo
            .createQueryBuilder("course");

        qb.addCommonTableExpression(
                `
                SELECT ST_SetSRID(ST_MakePoint(:...coords), 4326) AS geom
                `,
                "location"
            ).setParameter("coords", location)
            .addFrom("location", "loc");

        setSelect(qb, pace);
        setSelectBookmarked(qb, userId);

        qb.addSelect(
            `ST_DistanceSphere(course.departure, loc.geom)`,
            "distance"
        );

        qb.where(`ST_DWithin(course.departure, loc.geom, :radius)`, { radius });
        qb.orderBy("distance", "ASC");

        return qb.getRawMany<CourseDTO>();
    }



}

