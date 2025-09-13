import workerpool, { Pool, WorkerPoolOptions } from "workerpool";
import { Logger, OnModuleDestroy } from "@nestjs/common";

export class WorkersPoolService implements OnModuleDestroy {
    private readonly pool: Pool;

    constructor(
       workerPath: string,
       options: WorkerPoolOptions,
    ) {
        Logger.debug(workerPath, WorkersPoolService.name);
        this.pool = workerpool.pool(workerPath, options);
    }

    async onModuleDestroy(): Promise<void> {
        await this.pool.terminate(true);
    }

    async exec<T>(
        methodName: string,
        ...args: unknown[]
    ): Promise<Awaited<T>> {
        return await this.pool.exec(methodName, args);
    }
}