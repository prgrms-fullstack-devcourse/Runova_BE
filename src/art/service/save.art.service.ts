import { Inject, Injectable } from "@nestjs/common";
import { FilesService } from "../../files/files.service";
import { HttpService } from "@nestjs/axios";
import { UploadType } from "../../common/constants/upload-type.enum";
import { AxiosError } from "axios";
import { ArtOptions } from "../art.options";
import { Canvas } from "skia-canvas";

@Injectable()
export class SaveArtService {
    private readonly contentType: string;

    constructor(
       @Inject(FilesService)
       private readonly filesService: FilesService,
       @Inject(HttpService)
       private readonly httpService: HttpService,
       @Inject(ArtOptions)
       { format }: ArtOptions,
    ) {
        this.contentType = `image/${format}`;
    }

    async saveToS3(art: Uint8Array, userId: number): Promise<string> {


        const { url, region, bucket, key } = await this.filesService.getPresignedUrl(
            UploadType.ART,
            this.contentType,
            art.byteLength,
            userId,
        );

        await this.httpService.axiosRef.put(url, art, {
            headers: { "Content-Type": this.contentType, "Content-Length": art.byteLength },
        }).catch(err => {

            if (err instanceof AxiosError) {
                const status = err.response?.status;
                const statusText = err.response?.statusText;
                throw Error(`S3 PUT failed: ${status} ${statusText}`);
            }

            throw err;
        });

        return `https://${bucket}.s3.${region}.amazonaws.com/${key}`; // art url
    }

}