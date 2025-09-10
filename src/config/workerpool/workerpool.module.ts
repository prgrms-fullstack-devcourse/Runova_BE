import { DynamicModule, Module } from "@nestjs/common";
import { WorkerPoolService } from "./workerpool.service";
import { WORKER_POOL_OPTIONS } from "./token";
import { workerPoolOptionsFactory } from "./workerpool.options.factory";
import { ConfigService } from "@nestjs/config";
import { WorkerPoolOptions } from "workerpool";

@Module({})
export class WorkerPoolModule {
    static register(workerPath: string): DynamicModule {
        return {
            module: WorkerPoolModule,
            providers: [
                {
                    provide: WORKER_POOL_OPTIONS,
                    useFactory: workerPoolOptionsFactory,
                    inject: [ConfigService],
                },
                {
                    provide: WorkerPoolService,
                    useFactory: (options: WorkerPoolOptions): WorkerPoolService =>
                        new WorkerPoolService(workerPath, options),
                    inject: [WORKER_POOL_OPTIONS]
                }
            ],
            exports: [WorkerPoolService, WORKER_POOL_OPTIONS],
        }
    };

}