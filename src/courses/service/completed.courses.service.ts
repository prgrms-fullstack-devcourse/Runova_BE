import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CompletedCourse } from "../../modules/courses";
import { Repository } from "typeorm";
import { InspectRunningRecordService } from "./inspect.running.record.service";
import { CompleteCourseDTO } from "../dto";
import { Transactional } from "typeorm-transactional";

@Injectable()
export class CompletedCoursesService {

    constructor(
       @InjectRepository(CompletedCourse)
       private readonly completedCoursesRepo: Repository<CompletedCourse>,
       @Inject(InspectRunningRecordService)
       private readonly inspectRecordService: InspectRunningRecordService,
    ) {}

    @Transactional()
    async completeCourse(dto: CompleteCourseDTO): Promise<void> {
        await this.validate(dto);

        await this.completedCoursesRepo
            .createQueryBuilder()
            .insert()
            .into(CompletedCourse)
            .values(dto)
            .updateEntity(false)
            .orIgnore(true)
            .execute();
    }

    async validate(dto: CompleteCourseDTO): Promise<void> {

        const { isExists, hasValidPath }
            = await this.inspectRecordService.inspectRecord(dto);

        if (!isExists) throw new NotFoundException("존재하지 않는 레코드이거나 권한이 없습니다.");
        if (!hasValidPath) throw new ConflictException("경로와 레코드의 경로가 일치하지 않습니다.");
    }
}