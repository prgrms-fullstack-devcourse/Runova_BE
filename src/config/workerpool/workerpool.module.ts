import { Global, Module } from "@nestjs/common";
import { poolFactory } from "./pool.factory";
import { ConfigService } from "@nestjs/config";

export const WORKER_POOL =Symbol.for("WORKER_POOL");

@Global()
@Module({
    providers: [
        {
            provide: WORKER_POOL,
            useFactory: poolFactory,
            inject: [ConfigService],
        }
    ],
    exports: [WORKER_POOL],
})
export class WorkerPoolModule {}