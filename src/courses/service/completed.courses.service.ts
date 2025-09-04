import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CompletedCourse } from "../../modules/courses";
import { Repository } from "typeorm";
import { InspectRecordService } from "./inspect.record.servcie";
import { CompleteCourseDTO } from "../dto";
import { Transactional } from "typeorm-transactional";

@Injectable()
export class CompletedCoursesService {

    constructor(
       @InjectRepository(CompletedCourse)
       private readonly completedCoursesRepo: Repository<CompletedCourse>,
       @Inject(InspectRecordService)
       private readonly inspectRecordService: InspectRecordService,
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

        if (!isExists) throw new NotFoundException(dto);
        if (!hasValidPath) throw new ConflictException(dto);
    }
}