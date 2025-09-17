import { Inject, Injectable } from "@nestjs/common";
import { FilesService } from "../../../files/files.service";
import { HttpService } from "@nestjs/axios";
import { UploadType } from "../../../common/constants/upload-type.enum";
import { AxiosError } from "axios";

@Injectable()
export class SaveArtService {

    constructor(
       @Inject(FilesService)
       private readonly filesService: FilesService,
       @Inject(HttpService)
       private readonly httpService: HttpService,
    ) {}

    async saveToS3(userId: number, png: Uint8Array): Promise<string> {

        const { url, region, bucket, key } = await this.filesService.getPresignedUrl(
            UploadType.ART,
            "image/png",
            png.byteLength,
            userId,
        );

        await this.httpService.axiosRef.put(url, png, {
            headers: { "Content-Type": "image/png", "Content-Length": png.byteLength },
        }).catch(err => {

            if (err instanceof AxiosError) {
                const status = err.response?.status;
                const statusText = err.response?.statusText;
                throw Error(`S3 PUT failed: ${status} ${statusText}`);
            }

            throw err;
        });

        return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    }

}