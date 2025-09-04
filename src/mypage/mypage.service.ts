import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { User } from "../modules/users/user.entity";
import { Course } from "../modules/courses/course.entity";
import { Post, PostType } from "../modules/posts/post.entity";
import { MyPageOverviewDto } from "./dto/mypage.dto";

const PREVIEW_COUNT = 2;

@Injectable()
export class MyPageService {
  constructor(private readonly ds: DataSource) {}

  private toIso(d: Date | null | undefined) {
    return d ? d.toISOString() : "";
  }

  async getOverview(userId: number): Promise<MyPageOverviewDto> {
    const userRepo = this.ds.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: userId },
      select: ["id", "nickname", "email", "avatarUrl", "createdAt"],
    });
    if (!user) throw new NotFoundException("USER_NOT_FOUND");

    const courseRepo = this.ds.getRepository(Course);
    const postRepo = this.ds.getRepository(Post);

    const [courses, postsAll, proofPosts] = await Promise.all([
      courseRepo.find({
        where: { userId },
        order: { createdAt: "DESC" },
        take: PREVIEW_COUNT,
        select: ["id", "title", "length", "createdAt", "imageURL"],
      }),
      postRepo.find({
        where: { authorId: userId },
        order: { createdAt: "DESC" },
        take: PREVIEW_COUNT,
        select: [
          "id",
          "title",
          "content",
          "createdAt",
          "likeCount",
          "commentCount",
          "type",
        ],
      }),

      postRepo.find({
        where: { authorId: userId, type: PostType.PROOF, isDeleted: false },
        order: { createdAt: "DESC" },
        take: PREVIEW_COUNT,
        select: ["id", "routeId", "title", "imageUrls", "createdAt"],
      }),
    ]);

    const dto: MyPageOverviewDto = {
      profile: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        avatarUrl: user.avatarUrl ?? "",
        createdAt: this.toIso(user.createdAt),
      },
      myCourses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        length: c.length,
        createdAt: this.toIso(c.createdAt),
        previewImageUrl: (c as any).imageURL ?? "",
      })),
      myPosts: postsAll.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        createdAt: this.toIso(p.createdAt),
        likeCount: p.likeCount ?? 0,
        commentCount: p.commentCount ?? 0,
      })),
      myPhotos: proofPosts
        .filter((ph) => Array.isArray(ph.imageUrls) && ph.imageUrls.length > 0)
        .slice(0, PREVIEW_COUNT)
        .map((ph) => ({
          id: ph.id,
          courseId: ph.routeId ?? 0,
          title: ph.title,
          imageUrl: ph.imageUrls[0],
          createdAt: this.toIso(ph.createdAt),
        })),
    };

    return dto;
  }
}
