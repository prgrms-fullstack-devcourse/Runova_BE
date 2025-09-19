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

    async pickRandomArtUrl(userId: number): Promise<string | null> {

        const records = await this.recordsRepo.find({
            select: ["id", "userId", "artUrl"],
            where: { userId },
        });

        if (!records.length) return null;

        const idx = Math.floor(Math.random() * records.length);
        return records[idx].artUrl;
    }
}

