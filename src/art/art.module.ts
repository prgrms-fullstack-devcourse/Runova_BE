import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { RunningRecord } from "../modules/running";
import { HttpModule } from "@nestjs/axios";
import { FilesModule } from "../files/files.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([RunningRecord]),
        HttpModule.register({}),
        FilesModule,
    ],
    providers: [],
    controllers: [],
})
export class ArtModule {}
