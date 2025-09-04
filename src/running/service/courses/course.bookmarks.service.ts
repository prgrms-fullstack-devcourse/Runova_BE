import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CourseBookmark } from "../../../modules/running";
import { Repository } from "typeorm";
import { Transactional } from "typeorm-transactional";

@Injectable()
export class CourseBookmarksService {

    constructor(
       @InjectRepository(CourseBookmark)
       private readonly bookmarksRepo: Repository<CourseBookmark>,
    ) {}

    @Transactional()
    async updateBookmark(userId: number, courseId: number): Promise<boolean> {

        const bookmark = await this.bookmarksRepo
            .createQueryBuilder("bookmark")
            .select("bookmark.id", "id")
            .where("bookmark.userId = :userId", { userId })
            .andWhere("bookmark.courseId = :courseId", { courseId })
            .getOne();

        bookmark
            ? await this.bookmarksRepo.delete(bookmark.id)
            : await this.bookmarksRepo.insert({ userId, courseId });

        return !bookmark;
    }
}