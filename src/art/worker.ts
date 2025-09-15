import { INestApplicationContext } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ArtModule } from "./art.module";
import { ConstellationService } from "./service";
import { move } from "piscina";

let __app: INestApplicationContext;

async function __getAppContext(): Promise<INestApplicationContext> {
  if (!__app) __app = await NestFactory.createApplicationContext(ArtModule);
  return __app;
}

export default async function (path: Float32Array): Promise<ArrayBuffer> {
  if (path.length % 2 !== 0) throw RangeError("Length should be even");
  if (path.length  < 4) throw RangeError("Length should be greater than 4");

  const app: INestApplicationContext = await __getAppContext();

  const buf: Buffer = await app.get(ConstellationService)
    .generateConstellation(path);

  const result = buf.buffer
    .slice(
      buf.byteOffset,
      buf.byteOffset + buf.byteLength
    ) as ArrayBuffer;

  return move(result) as ArrayBuffer;
}