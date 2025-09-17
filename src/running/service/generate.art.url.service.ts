import { Inject, Injectable } from "@nestjs/common";
import Piscina, { move } from "piscina";
import { GenerateArtDTO } from "../../workers/art/dto";
import { PiscinaFactory } from "../../config/piscina";
import { WORKER_ROOT } from "../../workers";

@Injectable()
export class GenerateArtUrlService {
    private readonly convertPointsWorkers: Piscina<Float32Array, Float32Array>;
    private readonly generateArtWorkers: Piscina<GenerateArtDTO, string>;


    constructor(
        @Inject(PiscinaFactory)
        factory: PiscinaFactory,
    ) {

        this.convertPointsWorkers = factory.getInstance<Float32Array, Float32Array>(
            `${WORKER_ROOT}/geometry/convert.points.to.utm-k.worker.js`
        );

        this.generateArtWorkers = factory.getInstance<GenerateArtDTO, string>(
            `${WORKER_ROOT}/art/generate.art.worker.js`,
        );
    }

    async generateArtUrl(
        userId: number,
        path: [number, number][],
    ): Promise<string> {
        const points: Float32Array = await this.convert(path);

        return await this.generateArtWorkers.run({
            userId,
            points: move(points) as Float32Array,
        });
    }

    private async convert(path: [number, number][]): Promise<Float32Array> {
        const flattened: Float32Array = Float32Array.from(path.flat());

        return await this.convertPointsWorkers.run(
            move(flattened) as Float32Array,
        );
    }
}


