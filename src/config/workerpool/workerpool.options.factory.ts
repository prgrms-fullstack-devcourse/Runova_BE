import { ConfigService } from "@nestjs/config";
import { WorkerPoolOptions } from "workerpool";

export function workerPoolOptionsFactory(
    config: ConfigService
): WorkerPoolOptions {
    return {
        workerType: "thread",
        maxWorkers: config.get<number>("POOL_MAX_WORKERS") ?? 10,
        maxQueueSize: config.get<number>("POOL_MAX_QUEUE_SIZE") ?? 30,
    };
}