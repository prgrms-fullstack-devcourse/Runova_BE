import { Module } from '@nestjs/common';
import { GenerateArtService, ConstellationStyleService, SaveArtService } from "./service";
import { HttpModule } from "@nestjs/axios";
import { FilesService } from "../files/files.service";
import { FilesModule } from "../files/files.module";


const __EXTERNAL_PROVIDERS = [FilesService];

@Module({
  imports: [
      HttpModule.register({}),
      FilesModule,
  ],
  providers: [
      ...__EXTERNAL_PROVIDERS,
    GenerateArtService,
    ConstellationStyleService,
    SaveArtService,
  ]
})
export class ArtModule {}
