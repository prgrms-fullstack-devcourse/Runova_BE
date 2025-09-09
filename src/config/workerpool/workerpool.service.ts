import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool, pool } from "workerpool";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class WorkerPoolService implements OnModuleDestroy {
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

    async exec<F extends (...args: any[]) => any>(
        f: F,
        ...args: Parameters<F>
    ): Promise<Awaited<ReturnType<F>>> {
        return await this.pool.exec<F>(f, args);
    }
}