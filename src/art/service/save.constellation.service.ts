import { Inject, Injectable } from "@nestjs/common";
import { FilesService } from "../../files/files.service";
import { UploadType } from "../../common/constants/upload-type.enum";

@Injectable()
export class SaveConstellationService {

    constructor(
       @Inject(FilesService)
       private readonly filesService: FilesService,
    ) {}

    async saveToS3(userId: number, svg: Uint8Array): Promise<string> {

        const { url } = await this.filesService
            .getPresignedUrl(
                UploadType.ART,
                "image/svg",
                svg.byteLength,
                userId,
            );

        await __uploadSVG(url, svg);
        return url;
    }

}

async function __uploadSVG(url: string, svg: Uint8Array) {

    const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "image/svg", "Content-Length": String(svg.byteLength) },
        body: svg,
    });

    if (!res.ok) throw new Error(`S3 PUT failed: ${res.status} ${res.statusText}`);
}