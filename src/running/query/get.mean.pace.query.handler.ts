import { QueryHandler } from "@nestjs/cqrs";
import { GetMeanPaceQuery } from "./get.mean.pace.query";
import { GetRunningStatisticsQueryHandler } from "./get.running.statistics.query.handler";
import { InjectRepository } from "@nestjs/typeorm";
import { RunningRecord } from "../../modules/running";
import { Repository } from "typeorm";

@QueryHandler(GetMeanPaceQuery)
export class GetMeanPaceQueryHandler
    extends GetRunningStatisticsQueryHandler<"meanPace">
{
    constructor(
        @InjectRepository(RunningRecord)
        repo: Repository<RunningRecord>
    ) { super(repo); }
}