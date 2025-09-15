import { Module } from '@nestjs/common';
import { ConstellationService, ConstellationStyleService } from "./service";

@Module({
  providers: [
    ConstellationService,
    ConstellationStyleService,
  ]
})
export class ArtModule {}
