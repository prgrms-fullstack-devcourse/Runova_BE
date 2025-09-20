import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RunningRecord } from "../../modules/running";
import { Between, FindOptionsWhere, LessThan, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import { Transactional } from "typeorm-transactional";
import { CreateRunningRecordDTO, RunningRecordDTO, RunningRecordPreviewDTO, SearchRunningRecordsDTO } from "../dto";
import { Cursor, Period } from "../../common/types";
import { GenerateArtUrlService } from "./generate.art.url.service";

@Injectable()
export class RunningRecordsService {

    constructor(
       @InjectRepository(RunningRecord)
       private readonly recordsRepo: Repository<RunningRecord>,
       @Inject(GenerateArtUrlService)
       private readonly generateArtUrlService: GenerateArtUrlService,
    ) {}

    @Transactional()
    async createRunningRecord(dto: CreateRunningRecordDTO): Promise<void> {
        const { id } = await this.recordsRepo.save(dto);
        const artUrl = await this.generateArtUrlService.generateArtUrl(id, dto.userId);
        await this.recordsRepo.update(id, { artUrl });
    }

    async getRunningRecord(id: number, userId: number): Promise<RunningRecordDTO> {

        const record = await this.recordsRepo
            .createQueryBuilder("record")
            .select(`record.id`, "id")
            .addSelect(`record.artUrl`, "artUrl")
            .addSelect(`record.imageUrl`, "imageUrl")
            .addSelect(`record.startAt`, "startAt")
            .addSelect(`record.endAt`, "endAt")
            .addSelect(`record.duration`, "duration")
            .addSelect(`record.distance`, "distance")
            .addSelect(`record.calories`, "calories")
            .addSelect(`record.pace`, "pace")
            .leftJoin(`record.course`, "course")
            .addSelect(
                `
                CASE 
                    WHEN course IS NULL THEN NULL
                    ELSE jsonb_build_object('id', course.id, 'title', course.title)
                END
                `,
                "course"
            )
            .where(`record.id = :id`, { id })
            .andWhere(`record.userId = :userId`, { userId })
            .getRawOne<RunningRecordDTO>();

        if (!record) throw new NotFoundException();
        return record;
    }

    async searchRunningRecords(
        dto: SearchRunningRecordsDTO
    ): Promise<RunningRecordPreviewDTO[]> {
        const { userId, period, paging } = dto;

        return await this.recordsRepo
            .find({
                select: ["id", "artUrl", "imageUrl"],
                where: __makeFindOptionsWhere(
                    userId, period, paging?.cursor
                ),
                order: { id: "DESC" },
                take: paging?.limit,
            });
    }
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