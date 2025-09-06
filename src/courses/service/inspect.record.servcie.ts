import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Course } from "../../modules/courses";
import { Repository } from "typeorm";
import { CompleteCourseDTO, InspectRecordResult } from "../dto";
import { RunningRecord } from "../../modules/running";
import { plainToInstanceOrReject } from "../../utils";

@Injectable()
export class InspectRecordService {

    constructor(
       @InjectRepository(Course)
       private readonly coursesRepo: Repository<Course>,
    ) {}

    async inspectRecord(dto: CompleteCourseDTO): Promise<InspectRecordResult> {

        const raw = await this.coursesRepo
            .createQueryBuilder("course")
            .leftJoin(RunningRecord, "record", `record.id = :recordId`)
            .select(
                `record IS NOT NULL AND record.userId = :userId`,
                "isExists"
            )
            .addSelect(
                `record IS NOT NULL AND ST_Equals(course.path, record.path)`,
                "hasValidPath"
            )
            .where(`course.id = :courseId`)
            .setParameters(dto)
            .getRawOne();

        return plainToInstanceOrReject(InspectRecordResult, raw);
    }

}