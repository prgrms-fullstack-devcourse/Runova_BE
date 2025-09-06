import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CompletedCourse, Course, CourseBookmark } from "../../modules/courses";
import { Repository } from "typeorm";
import { AdjacentCourseDTO, CourseDTO, SearchAdjacentCoursesDTO } from "../dto";
import { plainsToInstancesOrReject } from "../../utils";
import { PagingOptions } from "../../common/paging";
import {
    setPagingOptions,
    setSelect,
    setSelectBookmarked,
    setSelectCompleted
} from "./search.courses.service.internal";
import { GetMeanPaceService } from "./get.mean.pace.service";

@Injectable()
export class SearchCoursesService {

    constructor(
        @InjectRepository(Course)
        private readonly coursesRepo: Repository<Course>,
        @InjectRepository(CourseBookmark)
        private readonly bookmarksRepo: Repository<CourseBookmark>,
        @InjectRepository(CompletedCourse)
        private readonly completedCoursesRepo: Repository<CompletedCourse>,
        @Inject(GetMeanPaceService)
        private readonly getMeanPaceService: GetMeanPaceService,
    ) {}

    async searchUserCourses(
        userId: number,
        options?: PagingOptions,
    ): Promise<CourseDTO[]> {

        const qb = setSelect(
            this.coursesRepo.createQueryBuilder("course"),
            await this.getMeanPaceService.getMeanPace(userId)
        );

        setSelectBookmarked(qb, userId);
        setSelectCompleted(qb, userId);
        qb.where("course.userId = :userId", { userId });
        setPagingOptions(qb, options ?? {});

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

        setSelect(qb, await this.getMeanPaceService.getMeanPace(userId));
        qb.addSelect("bookmarked", "true");
        setSelectCompleted(qb, userId);
        qb.where("bookmark.userId = :userId", { userId });
        setPagingOptions(qb, options ?? {});

        const raws = await qb.getRawMany();
        return plainsToInstancesOrReject(CourseDTO, raws);
    }

    async searchCompletedCourses(
        userId: number,
        options?: PagingOptions,
    ): Promise<CourseDTO[]> {

        const qb = this.completedCoursesRepo
            .createQueryBuilder("cc")
            .innerJoin(Course, "course", "course.id = cc.courseId");

        setSelect(qb, await this.getMeanPaceService.getMeanPace(userId));
        setSelectBookmarked(qb, userId);
        qb.addSelect("completed", "true");
        qb.where("cc.userId = :userId", { userId });
        setPagingOptions(qb, options ?? {});

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
                SELECT ST_SetSRID(ST_MakePoint(:...coords), 4326) AS geom
                `,
                "location"
            )
            .setParameter("coords", location)
            .addFrom("location", "loc");

        setSelect(qb, await this.getMeanPaceService.getMeanPace(userId));
        setSelectBookmarked(qb, userId);
        setSelectCompleted(qb, userId);

        qb.addSelect(
                `
                ST_DistanceSphere(course.departure, loc.geom)`,
                "distance"
        );

        qb.where(`ST_DWithin(course.departure, loc.geom, :radius)`, { radius })
        setPagingOptions(qb, pagingOptions);
        qb.orderBy("distance", "ASC");

        const raws = await qb.getRawMany();
        return plainsToInstancesOrReject(AdjacentCourseDTO, raws);
    }



}

