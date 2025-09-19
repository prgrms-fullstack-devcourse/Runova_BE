import { Module } from '@nestjs/common';
import { GenerateArtService, SaveArtService } from "./service";
import { HttpModule } from "@nestjs/axios";
import { FilesModule } from "../files/files.module";
import { ArtOptions } from "./art.options";

@Module({
  imports: [
      HttpModule.register({}),
      FilesModule,
  ],
  providers: [
    ArtOptions,
    GenerateArtService,
    SaveArtService,
  ]
})
export class ArtModule {}
