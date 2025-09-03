import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RunningRecord } from "../../modules/running";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { RunningRecordFilters } from "../dto";
import { MD5 } from "object-hash";
import { setFilters } from "./service.internal";

@Injectable()
export class CountRunningRecordsService {
    private readonly cacheTTL: number;

    constructor(
       @InjectRepository(RunningRecord)
       private readonly recordsRepo: Repository<RunningRecord>,
       @Inject(ConfigService)
       config: ConfigService,
    ) {
        this.cacheTTL = config.get<number>(
            "COUNT_RUNNING_RECORDS_CACHE_TTL",
        ) ?? 1.8 * 1_000_000; // default ttl is 30 minutes in milliseconds
    }

    async countRunningRecords(
        userId: number,
        filters?: RunningRecordFilters,
    ): Promise<number> {

        const qb = this.recordsRepo
            .createQueryBuilder("record")
            .select("1")
            .where("record.userId = :userId", { userId });

        filters && setFilters(qb, filters);

        return qb
            .cache(__makeCacheKey(userId, filters), this.cacheTTL)
            .getCount();
    }

}

function __makeCacheKey(userId: number, filters?: RunningRecordFilters): string {
    let cacheKey = `running-record:count:${userId}`;
    if (filters) cacheKey += `:${MD5(filters)}`;
    return cacheKey;
}