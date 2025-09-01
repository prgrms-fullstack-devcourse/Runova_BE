import { Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UploadType } from "../common/constants/upload-type.enum";
import { randomUUID } from "crypto";
import { fromEnv } from "@aws-sdk/credential-providers/dist-types/fromEnv";

const S3_EXPIRES_IN = 300;

@Injectable()
export class FilesService {
  private readonly s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: fromEnv(),
  });

  async getPresignedUrl(
    type: UploadType,
    contentType: string,
    size: number,
    userId: number
  ) {
    const bucket = process.env.S3_BUCKET!;
    const fileName = `${randomUUID()}`;
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const key =
      type === UploadType.AVATAR
        ? `users/${userId}/avatar/${fileName}`
        : `users/${userId}/verify/${today}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ContentLength: size,
      ACL: "private",
    });

    const url = await getSignedUrl(this.s3, command, {
      expiresIn: S3_EXPIRES_IN,
    });

    return { url, key, bucket, expiresIn: S3_EXPIRES_IN };
  }
}
