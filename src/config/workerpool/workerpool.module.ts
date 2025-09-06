import { Global, Module } from "@nestjs/common";
import { poolFactory } from "./pool.factory";
import { ConfigService } from "@nestjs/config";

export const WORKER_POOL = Symbol("WORKER_POOL");

@Global()
@Module({
    providers: [
        {
            provide: WORKER_POOL,
            useFactory: poolFactory,
            inject: [ConfigService],
        },
    ]
})
export class WorkerPoolModule {}