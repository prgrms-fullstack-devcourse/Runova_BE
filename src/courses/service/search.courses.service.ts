import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CompletedCourse, Course, CourseBookmark } from "../../modules/courses";
import { Repository } from "typeorm";
import { CourseDTO, SearchCoursesDTO } from "../dto";
import { plainsToInstancesOrReject } from "../../utils";
import {
    setPagingOptions,
    setSelect,
    setSelectBookmarked,
    setSelectCompleted
} from "./search.courses.service.internal";

@Injectable()
export class SearchCoursesService {

    constructor(
        @InjectRepository(Course)
        private readonly coursesRepo: Repository<Course>,
        @InjectRepository(CourseBookmark)
        private readonly bookmarksRepo: Repository<CourseBookmark>,
        @InjectRepository(CompletedCourse)
        private readonly completedCoursesRepo: Repository<CompletedCourse>,
    ) {}

    async searchUserCourses(dto: SearchCoursesDTO): Promise<CourseDTO[]> {
        const { userId, meanPace, location, filters, paging } = dto;

        const qb = setSelect(
            this.coursesRepo.createQueryBuilder("course"),
            meanPace, location,
        );

        setSelectBookmarked(qb, userId);
        setSelectCompleted(qb, userId);

        qb.where("course.userId = :userId", { userId });

        if (location && filters?.radius) {

        }

        setPagingOptions(qb, paging ?? {});

        return plainsToInstancesOrReject(CourseDTO, await qb.getRawMany());
    }

    async searchBookmarkedCourses(dto: Omit<SearchCoursesDTO, "filters">): Promise<CourseDTO[]> {
        const { userId, meanPace, location, paging } = dto;

        const qb = this.bookmarksRepo
            .createQueryBuilder("bookmark")
            .innerJoin(Course, "course", `course.id = bookmark.courseId`);

        setSelect(qb, meanPace, location);
        qb.addSelect("bookmarked", "true");
        setSelectCompleted(qb, userId);

        qb.where("bookmark.userId = :userId", { userId });
        setPagingOptions(qb, paging ?? {});

        return plainsToInstancesOrReject(CourseDTO, await qb.getRawMany());
    }

    async searchCompletedCourses(dto: Omit<SearchCoursesDTO, "filters">): Promise<CourseDTO[]> {
        const { userId, meanPace, location, paging } = dto;

        const qb = this.completedCoursesRepo
            .createQueryBuilder("cc")
            .innerJoin(Course, "course", `course.id = cc.courseId`);

        setSelect(qb, meanPace, location);
        setSelectBookmarked(qb, userId);
        qb.addSelect("completed", "true");

        qb.where("cc.userId = :userId", { userId });
        setPagingOptions(qb, paging ?? {});

        return plainsToInstancesOrReject(CourseDTO, await qb.getRawMany());
    }
}

