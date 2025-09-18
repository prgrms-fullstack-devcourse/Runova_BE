import { Injectable } from "@nestjs/common";
import Piscina from "piscina";
import { resolve } from "node:path";
import { GenerateArtDTO } from "../../art/dto";

@Injectable()
export class GenerateArtUrlService {
    private readonly piscina: Piscina<GenerateArtDTO, string>;

    constructor() {
        this.piscina = new Piscina({
            filename: resolve(__dirname, "../../art/worker.js"),
        });
    }

    async generateArtUrl(
        userId: number,
        path: [number, number][],
    ): Promise<string> {
        const points: Float32Array = Float32Array.from(path.flat());
        return await this.piscina.run({ userId, points });
    }
}


