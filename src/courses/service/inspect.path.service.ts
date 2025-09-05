import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import { Coordinates } from "../../common/geometry";
import { InspectPathResult } from "../dto";
import { pool, Pool } from "workerpool";
import { ConfigService } from "@nestjs/config";
import { inspectPath } from "./inspect.path.service.internal";

@Injectable()
export class InspectPathService implements OnModuleDestroy{
    private readonly pool: Pool;

    constructor(
        @Inject(ConfigService)
        config: ConfigService,
    ) {
        this.pool = pool({
                workerType: "thread",
                maxWorkers: config.get<number>("POOL_MAX_WORKERS") ?? 10,
                maxQueueSize: config.get<number>("POOL_MAX_QUEUE_SIZE") ?? 30,
        });
    }

    async onModuleDestroy(): Promise<void> {
        await this.pool.terminate(true);
    }


    async inspect(path: Coordinates[]): Promise<InspectPathResult> {
        return inspectPath(path);
    }

}
