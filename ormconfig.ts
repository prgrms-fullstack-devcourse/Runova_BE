import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import * as path from "path";

// 환경 변수 로드
dotenv.config({ path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`) });

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [path.join(__dirname, "src/**/*.entity{.ts,.js}")],
  migrations: [path.join(__dirname, "src/migrations/*{.ts,.js}")],
  ssl: process.env.DB_SSL === "true" ? { 
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === "true",
    ca: process.env.DB_SSL_CA ? process.env.DB_SSL_CA : undefined
  } : false,
  synchronize: false,
  logging: true,
});
