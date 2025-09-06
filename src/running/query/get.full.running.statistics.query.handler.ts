import { QueryHandler } from "@nestjs/cqrs";
import { GetFullRunningStatisticsQuery } from "./get.full.running.statistics.query";
import { GetRunningStatisticsQueryHandler } from "./get.running.statistics.query.handler";
import { InjectRepository } from "@nestjs/typeorm";
import { RunningRecord } from "../../modules/running";
import { Repository } from "typeorm";

@QueryHandler(GetFullRunningStatisticsQuery)
export class GetFullRunningStatisticsQueryHandler extends GetRunningStatisticsQueryHandler<
    "totalDistance" | "totalDuration" | "totalCalories" | "meanPace"
> {
    constructor(
        @InjectRepository(RunningRecord)
        repo: Repository<RunningRecord>,
    ) { super(repo); }
}