import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as fs from "node:fs";
import * as path from "path";

export function typeormOptionsFactory(
  config: ConfigService
): TypeOrmModuleOptions {
  const ca = config.get<string>("DB_SSL_CA");
  const ssl = ca
    ? {
        ca: fs.readFileSync(ca).toString(),
        rejectUnauthorized:
          config.get<boolean>("DB_SSL_REJECT_UNAUTHORIZED") ?? false,
      }
    : config.get<boolean>("DB_SSL")
      ? {
          rejectUnauthorized:
            config.get<boolean>("DB_SSL_REJECT_UNAUTHORIZED") ?? false,
        }
      : false;

  // const ssl = config.get("NODE_ENV") === "production"
  //     ?{ rejectUnauthorized: false }
  //     : undefined;

  return {
    type: "postgres" as any,
    host: config.get<string>("DB_HOST")!,
    port: Number(config.get<string>("DB_PORT") ?? 5432),
    username: config.get<string>("DB_USERNAME")!,
    password: config.get<string>("DB_PASSWORD")!,
    database: config.get<string>("DB_DATABASE")!,
    entities: [path.join(__dirname, "/../../**/*.entity{.ts,.js}")],
    //migrations: [path.join(__dirname, "/../../migrations/*{.ts,.js}")],
    ssl,
    logging: false,
    synchronize: false,
  };
}
