import { Inject, Injectable } from "@nestjs/common";
import { InspectPathResult } from "../dto";
import { WorkersPoolService } from "../../config/workerpool";
@Injectable()
export class InspectPathService {

    constructor(
       @Inject(WorkersPoolService)
       private readonly poolService: WorkersPoolService,
    ) {}

    async inspectPath(path: [number, number][]): Promise<InspectPathResult> {
        return this.poolService.exec<InspectPathResult>(
            "inspectPath",
            path,
        );
    }
}

