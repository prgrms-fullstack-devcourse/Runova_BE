import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Course } from "../../../modules/running";
import { Repository } from "typeorm";
import { CompleteCourseDTO, InspectRecordResult } from "../../courses/dto";
import { RunningRecord } from "../../../modules/running";
import { plainToInstanceOrReject } from "../../../utils";

@Injectable()
export class InspectRecordService {

    constructor(
        @InjectRepository(Course)
        private readonly coursesRepo: Repository<Course>,
    ) {}

    async inspectRecord(dto: CompleteCourseDTO): Promise<InspectRecordResult> {

        const raw = await this.coursesRepo
            .createQueryBuilder("course")
            .select(`record IS NOT NULL`, "isExists")
            .addSelect(
                `course IS NOT NULL AND record.userId = :userId`,
                "isOwn"
            )
            .addSelect(
                `course IS NOT NULL AND ST_Equals(course.path, record.path)`,
                "isValidPath"
            )
            .leftJoin(RunningRecord, "record", `record.id := recordId`)
            .where(`course.id = :courseId`)
            .setParameters(dto)
            .getRawOne();

        return plainToInstanceOrReject(InspectRecordResult, raw);
    }

}