import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { User } from "../modules/users/user.entity";
import { Course } from "../modules/courses/course.entity";
import { Post } from "../modules/posts/post.entity";
import { CertificationPhoto } from "../photos/certification-photo.entity";
import { MyPageOverviewDto } from "./dto/mypage.dto";

const PREVIEW_COUNT = 2; // 필요 시 3으로 조정

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
      select: [
        "id",
        "nickname",
        "email",
        "avatarUrl",
        "createdAt",
        "updatedAt",
        "description" as any,
      ],
    });

    if (!user) throw new NotFoundException("USER_NOT_FOUND");

    const courseRepo = this.ds.getRepository(Course);
    const postRepo = this.ds.getRepository(Post);
    const photoRepo = this.ds.getRepository(CertificationPhoto);

    const [courses, posts, photos] = await Promise.all([
      courseRepo.find({
        where: { userId },
        order: { createdAt: "DESC" },
        take: PREVIEW_COUNT,
        select: ["id", "title", "length", "createdAt", "previewImageUrl"],
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
        ],
      }),
      photoRepo.find({
        where: { userId },
        order: { createdAt: "DESC" },
        take: PREVIEW_COUNT,
        select: ["id", "courseId", "title", "imageUrl", "createdAt"],
      }),
    ]);

    const dto: MyPageOverviewDto = {
      profile: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        avatarUrl: user.avatarUrl ?? "",
        description: user.description ?? null,
        createdAt: this.toIso(user.createdAt),
      },
      myCourses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        length: c.length,
        createdAt: this.toIso(c.createdAt),
        previewImageUrl: c.previewImageUrl ?? "",
      })),
      myPosts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        createdAt: this.toIso(p.createdAt),
        likeCount: p.likeCount ?? 0,
        commentCount: p.commentCount ?? 0,
      })),
      myPhotos: photos.map((ph) => ({
        id: ph.id,
        courseId: ph.courseId,
        title: ph.title,
        imageUrl: ph.imageUrl,
        createdAt: this.toIso(ph.createdAt),
      })),
    };

    return dto;
  }
}
