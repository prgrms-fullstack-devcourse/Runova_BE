import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RunningRecord } from "../../modules/running";
import { Repository } from "typeorm";
import { Transactional } from "typeorm-transactional";
import { CreateRunningRecordDTO, RunningRecordDTO, SearchRunningRecordsDTO } from "../dto";
import { omit } from "../../utils/object";
import { plainToInstance } from "class-transformer";
import { setFilters } from "./service.internal";
import { plainsToInstancesOrReject } from "../../utils";

@Injectable()
export class RunningRecordsService {

    constructor(
       @InjectRepository(RunningRecord)
       private readonly recordsRepo: Repository<RunningRecord>,
    ) {}

    @Transactional()
    async createRunningRecord(dto: CreateRunningRecordDTO): Promise<void> {
        await this.recordsRepo.save(dto);
    }

    async searchRunningRecords(
        dto: SearchRunningRecordsDTO
    ): Promise<RunningRecordDTO[]> {
        const { userId, cursor, limit, ...filters } = dto;

        const qb =  this.recordsRepo
            .createQueryBuilder("running")
            .select(`running.id`, "id")
            .addSelect(`running.startAt`, "startAt")
            .addSelect(`running.endAt`, "endAt")
            .addSelect(
                `EXTRACT(EPOCH FROM running.endAt) - EXTRACT(EPOCH FROM running.startAt)`,
                "duration"
            )
            .addSelect(`running.distance`, "distance")
            .addSelect(`running.pace`, "pace")
            .addSelect(`record.calories`, "calories")
            .addSelect(
                `ST_AsGeoJSON(running.path)::jsonb.coordinates`,
                "path"
            )
            .addSelect(
                `ST_AsGeoJSON(ST_StartPoint(running.path))::jsonb.coordinates`,
            "departure"
           )
          .where("running.userId  = :userId", { userId });

        const raws = await setFilters(qb, filters)
            .andWhere("running.id < :cursor", { cursor: cursor ?? 0 })
            .limit(limit ?? 10)
            .getRawMany();


        return plainsToInstancesOrReject(RunningRecordDTO, raws);
    }
}

