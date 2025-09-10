import { OnModuleDestroy } from "@nestjs/common";
import { Pool, pool, WorkerPoolOptions } from "workerpool";

export class WorkerPoolService implements OnModuleDestroy {
    private readonly pool: Pool;

    constructor(
        workerPath: string,
        options: WorkerPoolOptions,
    ) {
        this.pool = pool(workerPath, options);
    }

    async onModuleDestroy(): Promise<void> {
        await this.pool.terminate(true);
    }

    async exec<F extends (...args: unknown[]) => unknown>(
        f: F,
        ...args: Parameters<F>
    ): Promise<Awaited<ReturnType<F>>> {
        return await this.pool.exec(f.name, args);
    }
}