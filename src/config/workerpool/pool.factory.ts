import { ConfigService } from "@nestjs/config";
import { Pool, pool } from "workerpool";

export function poolFactory(config: ConfigService): Pool {
    return pool({
        workerType: "thread",
        maxWorkers: config.get<number>("POOL_MAX_WORKERS") ?? 10,
        maxQueueSize: config.get<number>("POOL_MAX_QUEUE_SIZE") ?? 30,
    });
}