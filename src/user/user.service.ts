import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../modules/users/user.entity";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}

  private async buildAvatarDisplayUrl(user: User): Promise<string | null> {
    if (user.avatarKey) {
      const key = user.avatarKey.trim();
      const cdn = process.env.CLOUDFRONT_DOMAIN?.trim();
      if (cdn) {
        return `${cdn}/${key}`;
      }
      const bucket = process.env.S3_BUCKET?.trim();
      if (!bucket) throw new Error("S3_BUCKET not set");
      const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
      return await getSignedUrl(this.s3, cmd, { expiresIn: 60 * 5 });
    }
    return user.avatarUrl ?? null;
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

  async getMeWithAvatarUrl(userId: number) {
    const me = await this.userRepo.findOne({ where: { id: userId } });
    if (!me) throw new NotFoundException("User not found");

    const displayUrl = await this.buildAvatarDisplayUrl(me);
    return {
      id: me.id,
      name: me["name"],
      email: me["email"],
      avatarKey: me.avatarKey ?? null,
      avatarUrl: displayUrl,
    };
  }
}
