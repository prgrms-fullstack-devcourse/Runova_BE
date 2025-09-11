import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { RunningRecord } from "../../modules/running";
import { DataSource, SelectQueryBuilder } from "typeorm";
import { RunningDashboardDTO } from "../dto";
import { Period } from "../../common/types";

@Injectable()
export class RunningDashboardsService {

    constructor(
       @InjectDataSource()
       private readonly ds: DataSource,
    ) {}

    async getRunningDashboard(
        userId: number,
        period?: Period,
    ): Promise<RunningDashboardDTO> {

        const qb = this.ds.createQueryBuilder()
            .select(`COUNT(record)`, "nRecords")
            .addSelect(`SUM(record.distance)`, "totalDistance")
            .addSelect(`SUM(record.duration)`, "totalDuration")
            .addSelect(`SUM(record.calories)`, "totalCalories")
            .addSelect(`AVG(record.pace)`, "meanPace");

        if (period && (period.since || period.until)) {
            qb.from(__SubQueryFactory(userId, period), "record");
        }
        else {
            qb.from(RunningRecord, "record")
                .where(`record.userId = :userId`, { userId })
                .groupBy("record.userId");
        }

        const dashboard: RunningDashboardDTO | undefined
            = await qb.getRawOne<RunningDashboardDTO>();

        return dashboard ?? {
            nRecords: 0,
            totalDistance: 0.0,
            totalDuration: 0.0,
            totalCalories: 0.0,
            meanPace: 0.0,
        };
    }
}

function __SubQueryFactory<E extends object>(
   userId: number,
   { since, until }: Period,
) {
    return (sqb: SelectQueryBuilder<E>): SelectQueryBuilder<E> => {

        sqb.select("*")
            .from(RunningRecord, "record")
            .where(`record.userId = := userId`, { userId });

        since && sqb.andWhere(`record.createdAt >= :since`, { since });
        until && sqb.andWhere(`record.createdAt <= :until`, { until });

        return sqb;
    };
}

