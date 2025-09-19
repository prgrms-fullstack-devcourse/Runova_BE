import { BadRequestException, INestApplicationContext } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ArtModule } from "./art.module";
import { GenerateArtService, SaveArtService } from "./service";
import { GenerateArtDTO } from "./dto";

let __app: INestApplicationContext;

async function __getAppContext(): Promise<INestApplicationContext> {
  if (!__app) __app = await NestFactory.createApplicationContext(ArtModule);
  return __app;
}

export default async function (dto: GenerateArtDTO): Promise<string> {
  const { points, userId } = dto;

  if (points.length % 2 !== 0) throw new BadRequestException("Length should be even");
  if (points.length  < 4) throw new BadRequestException("Length should be greater than 4");

  const app: INestApplicationContext = await __getAppContext();
  const art: Uint8Array = await app.get(GenerateArtService).generate(points);
  return await app.get(SaveArtService).saveToS3(art, userId);
}