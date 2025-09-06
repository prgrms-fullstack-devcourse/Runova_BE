import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RunningCourse } from "../../modules/running";
import { Repository } from "typeorm";

@Injectable()
export class RunningCoursesService {

    constructor(
       @InjectRepository(RunningCourse)
       private readonly runningCoursesRepo: Repository<RunningCourse>,
    ) {}



}