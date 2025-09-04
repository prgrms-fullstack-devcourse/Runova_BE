import { ConfigService } from "@nestjs/config";
import { RedisOptions } from "iovalkey";
import { readFileSync } from "node:fs";

export async function redisOptionsFactory(
  config: ConfigService
): Promise<RedisOptions> {
  // elastic cache는 tls 연결을 강제하므로 프로덕션에서 필요함
  const ca = config.get<string>("REDIS_TLS_CA");
  const tls = ca ? { ca: readFileSync(ca) } : undefined;
  const host = config.get<string>("REDIS_HOST");
  const port = config.get<number>("REDIS_PORT");
  const db = config.get<number>("REDIS_DB") ?? 0;

  console.log("[RedisOptionsFactory] Redis config:", { host, port, db });

  return {
    host,
    port,
    db,
    tls,
  };
}
