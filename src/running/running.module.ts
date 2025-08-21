import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { RunningRecord } from "../modules/running";

@Module({
    imports: [TypeOrmModule.forFeature([RunningRecord])]
})
export class RunningModule {}
