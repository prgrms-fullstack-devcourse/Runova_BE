import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { InspectPathResult } from "../dto";
import { resolve } from "node:path";
import Piscina from "piscina";

@Injectable()
export class InspectPathService implements OnModuleDestroy {
    private readonly convertPointsWorkers: Piscina<>
    private readonly inspectPathWorkers: Piscina<[number, number][], InspectPathResult>;

    constructor() {
        this.inspectPathWorkers = new Piscina({
            filename: resolve(__dirname, "../worker/inspect.path.worker.js"),
        });
    }

    async onModuleDestroy(): Promise<void> {
        await this.inspectPathWorkers.close({ force: true });
    }

    async inspectPath(path: [number, number][]): Promise<InspectPathResult> {
        return await this.inspectPathWorkers.run(path);
    }
}

