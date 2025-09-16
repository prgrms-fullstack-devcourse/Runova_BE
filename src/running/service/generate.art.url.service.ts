import { Inject, Injectable } from "@nestjs/common";
import { FilesService } from "../../files/files.service";
import Piscina, { move } from "piscina";
import { resolve } from "node:path";
import { UploadType } from "../../common/constants/upload-type.enum";

@Injectable()
export class GenerateArtUrlService {
    private readonly piscina: Piscina<Float32Array, ArrayBuffer>;

    constructor(
       @Inject(FilesService)
       private readonly filesService: FilesService,
    ) {
        this.piscina = new Piscina({
            filename: resolve(__dirname, "../../art/worker.js")
        });
    }

    async generateArtUrl(
        userId: number,
        path: [number, number][],
    ): Promise<string> {

        const svg = await this.piscina.run(
            move(Float32Array.from(path.flat())) as Float32Array,
        );

        const { url: artUrl } = await this.filesService
            .getPresignedUrl(
                UploadType.ART,
                "image/svg",
                svg.byteLength,
                userId,
            );

        await __uploadArt(artUrl, svg);
        return artUrl;
    }

}


async function __uploadArt(url: string, svg: ArrayBuffer) {

    const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "image/svg", "Content-Length": String(svg.byteLength) },
        body: new Uint8Array(svg),
    });

    if (!res.ok) throw new Error(`S3 PUT failed: ${res.status} ${res.statusText}`);
}