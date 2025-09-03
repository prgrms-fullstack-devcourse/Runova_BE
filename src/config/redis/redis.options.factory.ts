import { ConfigService } from "@nestjs/config";
import { RedisOptions } from "ioredis";
import { readFileSync } from "node:fs";

export async function redisOptionsFactory(
  config: ConfigService
): Promise<RedisOptions> {
  // elastic cache는 tls 연결을 강제하므로 프로덕션에서 필요함
  const ca = config.get<string>("REDIS_TLS_CA");
  const tls = ca ? { ca: readFileSync(ca) } : undefined;

  return {
    host: config.get<string>("REDIS_HOST")!,
    port: config.get<number>("REDIS_PORT")!,
    db: config.get<number>("REDIS_DB") ?? 0,
    tls,
  };
}
