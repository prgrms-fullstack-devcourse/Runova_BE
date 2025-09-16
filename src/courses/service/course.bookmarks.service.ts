import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CourseBookmark } from "../../modules/courses";
import { Repository } from "typeorm";
import { Transactional } from "typeorm-transactional";

@Injectable()
export class CourseBookmarksService {

    constructor(
       @InjectRepository(CourseBookmark)
       private readonly bookmarksRepo: Repository<CourseBookmark>,
    ) {}

    @Transactional()
    async updateBookmark(courseId: number, userId: number): Promise<boolean> {

        const bookmark = await this.bookmarksRepo
            .createQueryBuilder("bookmark")
            .select("bookmark.id", "id")
            .where(`bookmark.courseId = :courseId`,  { courseId })
            .andWhere(`bookmark.userId = :userId`, { userId })
            .getRawOne<Pick<CourseBookmark, "id">>();

        bookmark
            ? await this.bookmarksRepo.delete(bookmark.id)
            : await this.bookmarksRepo.insert({ courseId, userId });

        return !bookmark;
    }
}