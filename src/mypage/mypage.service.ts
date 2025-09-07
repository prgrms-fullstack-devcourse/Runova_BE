import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { User } from "../modules/users/user.entity";
import { Course } from "../modules/courses/course.entity";
import { Post, PostType } from "../modules/posts/post.entity";
import { MyPageOverviewDto } from "./dto/mypage.dto";

const PREVIEW_COUNT = 2;

@Injectable()
export class MyPageService {
  private userRepo: Repository<User>;
  private courseRepo: Repository<Course>;
  private postRepo: Repository<Post>;

  constructor(private readonly dataSource: DataSource) {
    this.userRepo = dataSource.getRepository(User);
    this.courseRepo = dataSource.getRepository(Course);
    this.postRepo = dataSource.getRepository(Post);
  }

  private toIsoString(date: Date | null | undefined): string {
    return date ? date.toISOString() : "";
  }

  private async getProfile(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ["id", "nickname", "email", "avatarUrl", "createdAt"],
    });

    if (!user) {
      throw new NotFoundException("USER_NOT_FOUND");
    }

    return {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      avatarUrl: user.avatarUrl ?? "",
      createdAt: this.toIsoString(user.createdAt),
    };
  }

  private async getRecentCourses(userId: number) {
    const courses = await this.courseRepo.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: PREVIEW_COUNT,
      select: ["id", "title", "length", "createdAt", "imageUrl"],
    });

    return courses.map((course) => ({
      id: course.id,
      title: course.title,
      length: course.length,
      createdAt: this.toIsoString(course.createdAt),
      previewImageUrl: course.imageUrl ?? "",
    }));
  }

  private async getRecentPosts(userId: number) {
    const posts = await this.postRepo.find({
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
    });

    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: this.toIsoString(post.createdAt),
      likeCount: post.likeCount ?? 0,
      commentCount: post.commentCount ?? 0,
    }));
  }

  private async getRecentProofPhotos(userId: number) {
    const proofPosts = await this.postRepo.find({
      where: { authorId: userId, type: PostType.PROOF, isDeleted: false },
      order: { createdAt: "DESC" },
      take: PREVIEW_COUNT,
      select: ["id", "routeId", "title", "imageUrls", "createdAt"],
    });

    return proofPosts
      .filter(
        (post) => Array.isArray(post.imageUrls) && post.imageUrls.length > 0
      )
      .slice(0, PREVIEW_COUNT)
      .map((post) => ({
        id: post.id,
        courseId: post.routeId ?? 0,
        title: post.title,
        imageUrl: post.imageUrls[0],
        createdAt: this.toIsoString(post.createdAt),
      }));
  }

  async getOverview(userId: number): Promise<MyPageOverviewDto> {
    const [profile, courses, posts, proofPhotos] = await Promise.all([
      this.getProfile(userId),
      this.getRecentCourses(userId),
      this.getRecentPosts(userId),
      this.getRecentProofPhotos(userId),
    ]);

    return {
      profile,
      myCourses: courses,
      myPosts: posts,
      myPhotos: proofPhotos,
    };
  }
}
