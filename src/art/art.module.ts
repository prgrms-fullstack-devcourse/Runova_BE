import { Module } from '@nestjs/common';
import { GenerateArtService, ConstellationStyleService, SaveArtService } from "./service";
import { HttpModule } from "@nestjs/axios";
import { FilesModule } from "../files/files.module";

@Module({
  imports: [
      HttpModule.register({}),
      FilesModule,
  ],
  providers: [
    GenerateArtService,
    ConstellationStyleService,
    SaveArtService,
  ]
})
export class ArtModule {}
