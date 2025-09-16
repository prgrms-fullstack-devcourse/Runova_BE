import { Module } from '@nestjs/common';
import { ConstellationsService, ConstellationStyleService, SaveConstellationService } from "./service";
import { FilesService } from "../files/files.service";
import { FilesModule } from "../files/files.module";

const __EXTERNAL_PROVIDERS = [FilesService];

@Module({
  imports: [FilesModule],
  providers: [
      ...__EXTERNAL_PROVIDERS,
    ConstellationsService,
    ConstellationStyleService,
    SaveConstellationService,
  ]
})
export class ArtModule {}
