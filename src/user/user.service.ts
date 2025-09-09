import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "../modules/users";
import { Course } from "../modules/courses";
import { Post, PostType } from "../modules/posts";
import { ProfileDto } from "./dto/profile";

const PREVIEW_COUNT = 2;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>
  ) {}

  private toIso(date?: Date | null): string {
    return date ? date.toISOString() : "";
  }

  private async getProfileCore(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ["id", "nickname", "email", "imageUrl", "createdAt"],
    });
    if (!user) throw new NotFoundException("USER_NOT_FOUND");

    return {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      imageUrl: user.imageUrl ?? "",
      createdAt: this.toIso(user.createdAt),
    };
  }

  private async getRecentCourses(userId: number) {
    const courses = await this.courseRepo.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: PREVIEW_COUNT,
      select: ["id", "title", "length", "createdAt", "imageUrl"],
    });
    return courses.map((c) => ({
      id: c.id,
      title: c.title,
      length: c.length,
      createdAt: this.toIso(c.createdAt),
      previewImageUrl: c.imageUrl ?? "",
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
    return posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      createdAt: this.toIso(p.createdAt),
      likeCount: p.likeCount ?? 0,
      commentCount: p.commentCount ?? 0,
    }));
  }

  private async getRecentProofPhotos(userId: number) {
    const proofPosts = await this.postRepo.find({
      where: { authorId: userId, type: PostType.PROOF, isDeleted: false },
      order: { createdAt: "DESC" },
      take: PREVIEW_COUNT,
      select: ["id", "routeId", "title", "imageUrl", "createdAt"],
    });

    const sliced = proofPosts
      .filter((p) => !!p.imageUrl)
      .slice(0, PREVIEW_COUNT);

    return sliced.map((p) => ({
      id: p.id,
      courseId: p.routeId ?? 0,
      title: p.title,
      imageUrl: p.imageUrl ?? "",
      createdAt: this.toIso(p.createdAt),
    }));
  }

  async getProfile(userId: number): Promise<ProfileDto> {
    const [profile, myCourses, myPosts, myPhotos] = await Promise.all([
      this.getProfileCore(userId),
      this.getRecentCourses(userId),
      this.getRecentPosts(userId),
      this.getRecentProofPhotos(userId),
    ]);

    return { profile, myCourses, myPosts, myPhotos };
  }

  async updateAvatarUrl(userId: number, url: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const cleanUrl = url?.trim();
    if (!cleanUrl) throw new BadRequestException("url is required");

    await this.userRepo.update({ id: userId }, { imageUrl: cleanUrl });
  }
}
