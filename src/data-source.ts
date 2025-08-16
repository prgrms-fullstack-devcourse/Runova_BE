import "reflect-metadata";
import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { typeormOptionsFactory } from "./config/typeorm/index";
import { addTransactionalDataSource } from "typeorm-transactional";

const config = new ConfigService(process.env as any);
const base = typeormOptionsFactory(config);

// dev/ci에서는 ts, prod에서는 js 경로를 바라보도록
const migrations =
  process.env.NODE_ENV === "production"
    ? [__dirname + "/../../migrations/*{.js}"]
    : [__dirname + "/../../migrations/*{.ts,.js}"];

export const dataSource = addTransactionalDataSource(
  new DataSource({
    ...(base as any),
    migrations,
    synchronize: false,
    logging: false,
  })
);

export default dataSource;
