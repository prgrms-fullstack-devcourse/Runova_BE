import { BadRequestException, Injectable, NotFoundException, } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { User } from "../modules/users";
import { Course } from "../modules/courses";
import { Post, PostType } from "../modules/posts";
import { ProfileDto } from "./dto/profile";

const PREVIEW_COUNT = 2;

@Injectable()
export class UserService {
  private readonly s3 = new S3Client({
    region: process.env.AWS_REGION?.trim(),
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim()!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim()!,
    },
  });

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>
  ) {}

  private toIso(date?: Date | null): string {
    return date ? date.toISOString() : "";
  }

  private async buildDisplayUrlFromKey(key?: string | null): Promise<string> {
    if (!key) return "";
    const cdn = process.env.CLOUDFRONT_DOMAIN?.trim();
    if (cdn) return `${cdn}/${key}`;
    const bucket = process.env.S3_BUCKET?.trim();
    if (!bucket) throw new Error("S3_BUCKET not set");
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    return await getSignedUrl(this.s3, cmd, { expiresIn: 60 * 5 });
  }

  private async buildAvatarDisplayUrl(
    user: Pick<User, "avatarKey" | "avatarUrl">
  ): Promise<string> {
    if (user.avatarKey) {
      return this.buildDisplayUrlFromKey(user.avatarKey);
    }
    return user.avatarUrl ?? "";
  }

  private async getProfileCore(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: [
        "id",
        "nickname",
        "email",
        "avatarUrl",
        "avatarKey",
        "createdAt",
      ],
    });
    if (!user) throw new NotFoundException("USER_NOT_FOUND");

    return {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      avatarUrl: await this.buildAvatarDisplayUrl(user),
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
      select: ["id", "routeId", "title", "imageKey", "createdAt"],
    });

    const sliced = proofPosts
      .filter((p) => !!p.imageKey)
      .slice(0, PREVIEW_COUNT);

    return await Promise.all(
        sliced.map(async (p) => ({
          id: p.id,
          courseId: p.routeId ?? 0,
          title: p.title,
          imageUrl: await this.buildDisplayUrlFromKey(p.imageKey),
          createdAt: this.toIso(p.createdAt),
        }))
    );
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

  async updateAvatarKey(userId: number, key: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const cleanKey = key?.trim();
    if (!cleanKey) throw new BadRequestException("key is required");

    const expectedPrefix = `users/${userId}/avatar/`;
    if (!cleanKey.startsWith(expectedPrefix)) {
      throw new BadRequestException("Invalid key");
    }

    await this.userRepo.update({ id: userId }, { avatarKey: cleanKey });
  }
}
