import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RunningRecord } from "../../modules/running";
import {
    Between,
    FindManyOptions,
    FindOptionsWhere, LessThan,
    LessThanOrEqual,
    MoreThanOrEqual,
    Repository
} from "typeorm";
import { Transactional } from "typeorm-transactional";
import { CreateRunningRecordDTO, RunningRecordDTO, SearchRunningRecordsDTO } from "../dto";
import { omit } from "../../utils/object";
import { Cursor, Period } from "../../common/types";

@Injectable()
export class RunningRecordsService {

    constructor(
       @InjectRepository(RunningRecord)
       private readonly recordsRepo: Repository<RunningRecord>,
    ) {}

    // --ToDo 별자리 이미지 생성 로직 추가
    @Transactional()
    async createRunningRecord(dto: CreateRunningRecordDTO): Promise<void> {
        await this.recordsRepo.save(dto);
    }

    async getRunningRecord(id: number, userId: number): Promise<RunningRecordDTO> {

        const record = await this.recordsRepo
            .findOne({ where: { id, userId }, cache: true });

        if (!record) throw new NotFoundException();
        return omit(record, ["userId", "user", "createdAt"]);
    }

    async searchRunningRecords(
        dto: SearchRunningRecordsDTO
    ): Promise<RunningRecordDTO[]> {

        const records = await this.recordsRepo.find(
            __makeFindOptions(dto)
        );

        return records.map(record =>
            omit(record, ["userId", "createdAt", "user"])
        );
    }
}

function __makeFindOptions(
    dto: SearchRunningRecordsDTO
): FindManyOptions<RunningRecord> {
    const { userId, period, paging } = dto;

    const where: FindOptionsWhere<RunningRecord>
        = __makeFindOptionsWhere(userId, period, paging?.cursor);

    return { where, take: paging?.limit };
}

function __makeFindOptionsWhere(
    userId: number,
    period?: Period,
    cursor?: Cursor,
): FindOptionsWhere<RunningRecord> {
    const where: FindOptionsWhere<RunningRecord> = { userId };

    if (period?.since && period?.until)
        where.createdAt = Between(period.since, period.until);
    else if (period?.since)
        where.createdAt = MoreThanOrEqual(period.since);
    else if (period?.until)
        where.createdAt = LessThanOrEqual(period.until);

    cursor && (where.id = LessThan(cursor.id));
    return where;
}