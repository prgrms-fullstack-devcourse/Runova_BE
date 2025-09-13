import { DynamicModule, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WorkerPoolOptions } from "workerpool";
import { WorkersPoolService } from "./workerpool.service";

export const WORKER_POOL_OPTIONS = Symbol("WORKER_POOL_OPTIONS");

@Module({
    providers: [
        {
            provide: WORKER_POOL_OPTIONS,
            useFactory: (config: ConfigService): WorkerPoolOptions => ({
                workerType: "thread",
                maxWorkers: config.get<number>("POOL_MAX_WORKERS") ?? 5,
                maxQueueSize: config.get<number>("POOL_MAX_QUEUE_SIZE") ?? 30,
            }),
            inject: [ConfigService],
        }
    ],
    exports: [WORKER_POOL_OPTIONS],
})
export class WorkersPoolModule {

    static register(workerPath: string): DynamicModule {
        return {
            module: WorkersPoolModule,
            providers: [
                {
                    provide: WorkersPoolService,
                    useFactory: (options: WorkerPoolOptions): WorkersPoolService =>
                        new WorkersPoolService(workerPath, options),
                    inject: [WORKER_POOL_OPTIONS],
                }
            ],
            exports: [WorkersPoolService],
        }
    }

}
