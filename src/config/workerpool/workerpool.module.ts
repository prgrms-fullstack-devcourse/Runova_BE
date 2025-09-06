import { Global, Module } from "@nestjs/common";
import { WorkerPoolService } from "./workerpool.service";

@Global()
@Module({
    providers: [WorkerPoolService],
    exports: [WorkerPoolService],
})
export class WorkerPoolModule {}