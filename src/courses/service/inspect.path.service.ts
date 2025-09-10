import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import { InspectPathResult } from "../dto";
import { ConfigService } from "@nestjs/config";
import { Pool, WorkerPoolOptions, pool } from "workerpool";
import { resolve } from "node:path";

@Injectable()
export class InspectPathService implements OnModuleDestroy {
    private readonly pool: Pool;

    constructor(
       @Inject(ConfigService)
       config: ConfigService,
    ) {
        const workerPath: string = resolve(__dirname, "../worker/inspect.path.worker.js");

        const options: WorkerPoolOptions = {
            workerType: "thread",
            maxWorkers: config.get<number>("POOL_MAX_WORKERS") ?? 5,
            maxQueueSize: config.get<number>("POOL_MAX_QUEUE_SIZE") ?? 30,
        };

        this.pool = pool(workerPath, options);
    }

    async onModuleDestroy(): Promise<void> {
        await this.pool.terminate(true);
    }

    async inspectPath(path: [number, number][]): Promise<InspectPathResult> {
        return await this.pool.exec("inspectPath", [path]);
    }
}

