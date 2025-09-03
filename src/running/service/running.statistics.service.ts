import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RunningRecord } from "../../modules/running";
import { Repository } from "typeorm";
import { RunningStatisticsDTO, RunningRecordFilters } from "../dto";
import { setFilters } from "./service.internal";
import { plainToInstanceOrReject } from "../../utils";

@Injectable()
export class RunningStatisticsService {

    constructor(
       @InjectRepository(RunningRecord)
       private readonly recordsRepo: Repository<RunningRecord>
    ) {}

    async getRunningStatistics(
        userId: number,
        filters?: RunningRecordFilters
    ): Promise<RunningStatisticsDTO> {

        const qb = this.recordsRepo
            .createQueryBuilder("record")
            .select(`SUM(record.distance)`, "distance")
            .addSelect(
                `SUM(EXTRACT(EPOCH FROM record.endAt) - EXTRACT(EPOCH FROM record.startAt))`,
                "duration"
            )
            .addSelect(`AVG(record.pace)`, "pace")
            .addSelect(`SUM(record.calories)`, "calories")
            .where("record.userId = :userId", { userId });

        filters && setFilters(qb, filters);
        qb.groupBy("userId");

        const raw = await qb.getRawOne();
        return plainToInstanceOrReject(RunningStatisticsDTO, raw);
    }

}