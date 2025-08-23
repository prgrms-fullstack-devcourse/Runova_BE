import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RunningRecord } from "../../modules/running";
import { Repository } from "typeorm";
import { Transactional } from "typeorm-transactional";
import { CreateRunningRecordDTO, RunningRecordDTO, SearchRunningRecordsDTO } from "../dto";
import { DateTimeFormatter, Duration, nativeJs } from "@js-joda/core";
import { pick } from "../../utils/object";
import { RunningRecordPreview } from "../dto/running.record.preview";
import { plainToInstance } from "class-transformer";

@Injectable()
export class RunningRecordsService {

    private readonly formatter: DateTimeFormatter
        = DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm:ss");

    constructor(
       @InjectRepository(RunningRecord)
       private readonly recordsRepo: Repository<RunningRecord>,
    ) {}

    @Transactional()
    async createRunningRecord(dto: CreateRunningRecordDTO): Promise<void> {
        const { startAt, endAt, ...rest } = dto;

        await this.recordsRepo.insert({
            ...rest,
            startAt: () => startAt.toLocaleDateString(),
            endAt: () => endAt.toLocaleDateString()
        });
    }

    async getRunningRecord(id: number): Promise<RunningRecordDTO> {

        const record = await this.recordsRepo
            .findOne({ where: { id }, cache: true });

        if (!record) throw new NotFoundException();

        return {
            ...pick(record, ["id", "courseId", "path", "distance", "pace", "calories"]),
            startAt: record.startAt.format(this.formatter),
            endAt: record.endAt.format(this.formatter),
            duration: this.durationOf(record),
        };
    }

    async searchRunningRecords(
        dto: SearchRunningRecordsDTO
    ): Promise<RunningRecordPreview[]> {
        const { userId, cursor, limit } = dto;

        const raws = await this.recordsRepo
            .createQueryBuilder("record")
            .select("record.id", "id")
            .addSelect(
                `to_char(record.startAt, 'yyyy.MM.dd HH:mm:ss')`,
                "startAt"
            )
            .addSelect(
                `to_char(record.endAt, 'yyyy.MM.dd HH:mm:ss')`,
                "endAt"
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
            .where("record.userId  = :userId", { userId })
            .andWhere("record.id > :cursor", { cursor: cursor ?? 0 })
            .limit(limit ?? 10)
            .getRawMany();

        return raws.map(raw =>
            plainToInstance(RunningRecordPreview, raw)
        );
    }

    private durationOf(record: RunningRecord): string {
        const ms = Duration.between(record.startAt, record.endAt).toMillis();

        return nativeJs(new Date(ms))
            .format(this.formatter)
            .split(' ')[1];

    }

}

