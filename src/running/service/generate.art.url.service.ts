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
    private readonly tolerance: number;
    private readonly piscina: Piscina<GenerateArtDTO, string>;

    constructor(
        @InjectRepository(RunningRecord)
        private readonly recordsRepo: Repository<RunningRecord>,
        @Inject(ConfigService)
        config: ConfigService,
    ) {
        this.tolerance = config.get<number>(
            "PATH_SIMPLIFY_TOLERANCE",
        ) ?? 10;

        this.piscina = new Piscina({
            filename: resolve(__dirname, "../../art/worker.js"),
        });
    }

    async generateArtUrl(
        recordId: number,
        userId: number,
    ): Promise<string> {
        const path: [number, number][] = await this.getSimplifiedPath5179(recordId);
        const points: Float32Array = Float32Array.from(path.flat());
        return await this.piscina.run({ points, userId });
    }

    private async getSimplifiedPath5179(recordId: number): Promise<[number, number][]> {

        const result = await this.recordsRepo
            .createQueryBuilder("record")
            .select(
                `
                ST_AsGeoJSON(
                    ST_Simplify(ST_Transform(record.path, 5179), :tol)
                )::jsonb -> 'coordinates'
                `,
                "path5179"
            )
            .where(`record.id = :id`)
            .setParameters({ id: recordId, tol: this.tolerance })
            .getRawOne<{ path5179: [number, number][] }>();

        return result!.path5179;
    }

}


