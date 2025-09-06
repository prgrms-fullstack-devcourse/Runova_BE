import { ConfigService } from "@nestjs/config";
import workerpool, { Pool } from "workerpool";

export function poolFactory(config: ConfigService): Pool {
    return workerpool.pool({
        workerType: "thread",
        maxWorkers: config.get<number>("POOL_MAX_WORKERS") ?? 10,
        maxQueueSize: config.get<number>("POOL_MAX_QUEUE_SIZE") ?? 30,
    });
}