import { Inject, Injectable } from "@nestjs/common";
import { WorkerPoolService } from "../../config/workerpool";
import { InspectPathResult } from "../dto";
import { inspectPath } from "./inspect.path.service.internal";

@Injectable()
export class InspectPathService {

    constructor(
       @Inject(WorkerPoolService)
       private readonly poolService: WorkerPoolService,
    ) {}

    async makeCourseNodes(path: [number, number][]): Promise<InspectPathResult> {
        return await this.poolService.exec(inspectPath, path);
    }
}

