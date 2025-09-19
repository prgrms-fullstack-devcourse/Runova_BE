import { Inject, Injectable } from "@nestjs/common";
import Piscina from "piscina";
import { resolve } from "node:path";
import { GenerateArtDTO } from "../../art/dto";
import { InjectRepository } from "@nestjs/typeorm";
import { RunningRecord } from "../../modules/running";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GenerateArtUrlService {
    private readonly tol: number;
    private readonly piscina: Piscina<Float32Array, Uint8Array>;

    constructor(
        @InjectRepository(RunningRecord)
        private readonly recordsRepo: Repository<RunningRecord>,
        @Inject(ConfigService)
        config: ConfigService,
    ) {
        this.tol = config.get<number>(
            "ART_SIMPLIFY_TOLERANCE"
        ) ?? 10;

        this.piscina = new Piscina({
            filename: resolve(__dirname, "../../art/worker.js"),
        });
    }

    async generateArtUrl(
       courseId: number,
       userId: number,
    ): Promise<string> {
        const points: Float32Array = Float32Array.from(path.flat());
        return await this.piscina.run({ userId, points });
    }

    private async getSimplifiedPath5179(courseId: number): Promise<[number, number][]> {

        const result = await this.recordsRepo
            .createQueryBuilder("record")
            .select(
                `ST_Simplified()`
            )

    }

}


