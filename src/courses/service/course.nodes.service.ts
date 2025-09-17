import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CourseNode } from "../../modules/courses";
import { Repository } from "typeorm";
import Piscina from "piscina";
import { InspectPathResult } from "../../workers/geometry/dto";

@Injectable()
export class CourseNodesService {
    private readonly inspectPathWorkers: Piscina<Float32Array, InspectPathResult>;

    constructor(
       @InjectRepository(CourseNode)
       private readonly nodesRepo: Repository<CourseNode>,
    ) {}

}