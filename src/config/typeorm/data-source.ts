import "reflect-metadata";
import { DataSource } from "typeorm";
import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";

const env =
  process.env.NODE_ENV === "production" ? "production" : "development";
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [path.join(__dirname, "/../../**/*.entity{.js,.ts}")],
  migrations: [path.join(__dirname, "/../../migrations/*{.js,.ts}")],
  ssl: {
    rejectUnauthorized: true,
    ca: fs
      .readFileSync(path.join(process.cwd(), "etc/ssl/certs/global-bundle.pem"))
      .toString(),
  },
  synchronize: false,
  logging: false,
});
