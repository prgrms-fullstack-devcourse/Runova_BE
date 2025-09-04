import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CompletedCourse } from "../../../modules/running";
import { Repository } from "typeorm";
import { CompleteCourseDTO } from "../../courses/dto";
import { InspectRecordService } from "./inspect.record.service";
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

    private async validate(dto: CompleteCourseDTO): Promise<void> {

        const { isExists, isOwn, isValidPath }
            = await this.inspectRecordService.inspectRecord(dto);

        if (!isExists) throw new NotFoundException(dto);
        if (!isOwn) throw new ForbiddenException(dto);
        if (!isValidPath) throw new ConflictException(dto);
    }

}