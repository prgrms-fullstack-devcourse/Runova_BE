import { INestApplicationContext } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ArtModule } from "./art.module";
import { ConstellationsService, SaveConstellationService } from "./service";
import { move } from "piscina";
import { GenerateArtDTO } from "./dto";

let __app: INestApplicationContext;

async function __getAppContext(): Promise<INestApplicationContext> {
  if (!__app) __app = await NestFactory.createApplicationContext(ArtModule);
  return __app;
}

export default async function (dto: GenerateArtDTO): Promise<string> {
  const { userId, points } = dto;

  if (points.length % 2 !== 0) throw RangeError("Length should be even");
  if (points.length  < 4) throw RangeError("Length should be greater than 4");

  const app: INestApplicationContext = await __getAppContext();

  const svg: Uint8Array = await app.get(ConstellationsService)
    .generateConstellation(points);

  return await app.get(SaveConstellationService)
      .saveToS3(userId, svg);
}