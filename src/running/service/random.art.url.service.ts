import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RunningRecord } from "../../modules/running";
import { Repository } from "typeorm";

@Injectable()
export class RandomArtUrlService {

    constructor(
        @InjectRepository(RunningRecord)
        private readonly recordsRepo: Repository<RunningRecord>,
    ) {}

    async pickRandomArtUrl(userId: number): Promise<string[]> {

        const results = await this.recordsRepo
            .createQueryBuilder("record")
            .select(`record.artUrl`, "artUrl")
            .where(`record.userId = :userId`, { userId })
            .orderBy(`RANDOM()`)
            .limit(10)
            .getRawMany<Pick<RunningRecord, "artUrl">>();

        return results.map(r => r.artUrl);
    }
}

