import { ConfigService } from "@nestjs/config";
import Redis from "iovalkey";
import { readFileSync } from "node:fs";


export async function redisFactory(config: ConfigService): Promise<Redis> {
    // elastic cache는 tls 연결을 강제하므로 프로덕션에서 필요함
    const ca = config.get<string>("REDIS_TLS_CA");
    const tls = ca ? { ca: readFileSync(ca) } : undefined;

    return new Redis({
        host: config.get<string>("REDIS_HOST")!,
        port: config.get<number>("REDIS_PORT")!,
        db: config.get<number>("REDIS_DB") ?? 0,
        tls
    });
}

