import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RunningRecord } from "../../modules/running";
import { Repository } from "typeorm";
import { Transactional } from "typeorm-transactional";
import { CreateRunningRecordDTO, RunningRecordDTO, SearchRunningRecordsDTO } from "../dto";
import { omit } from "../../utils/object";
import { SearchRunningRecordResult } from "../dto/search.running.record.result";
import { plainToInstance } from "class-transformer";
import { setFilters } from "./service.internal";

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

    async getRunningRecord(id: number): Promise<RunningRecordDTO> {

        const record = await this.recordsRepo
            .findOne({ where: { id }, cache: true });

        if (!record) throw new NotFoundException();

        return {
            duration: (record.endAt.getTime() - record.startAt.getTime()) / 1000,
            ...omit(record, ["userId", "course", "createdAt"])
        };
    }

    async searchRunningRecords(
        dto: SearchRunningRecordsDTO
    ): Promise<SearchRunningRecordResult[]> {
        const { userId, cursor, limit, ...filters } = dto;

        const qb =  this.recordsRepo
            .createQueryBuilder("record")
            .select(`record.id`, "id")
            .addSelect(`record.startAt`, "startAt")
            .addSelect(`record.endAt`, "endAt")
            .addSelect(`record.distance`, "distance")
            .addSelect(`record.pace`, "pace")
            .addSelect(`record.calories`, "calories")
            .addSelect(
                `EXTRACT(EPOCH FROM record.endAt) - EXTRACT(EPOCH FROM record.startAt)`,
                "duration"
            )
            .addSelect(
                `
                jsonb_build_object(
                    'lon', ST_X(ST_StartPoint(record.path)),
                    'lat', ST_Y(ST_StartPoint(record.path))
                )
                `,
            "departure"
           )
          .where("record.userId  = :userId", { userId });

        const raws = await setFilters(qb, filters)
            .andWhere("record.id > :cursor", { cursor: cursor ?? 0 })
            .limit(limit ?? 10)
            .getRawMany();


        return raws.map(raw =>
            plainToInstance(SearchRunningRecordResult, raw)
        );
    }
}

