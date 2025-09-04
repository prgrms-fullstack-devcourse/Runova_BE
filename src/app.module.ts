import { Module } from "@nestjs/common";
import { join } from "node:path";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  typeormDataSourceFactory,
  typeormOptionsFactory,
} from "./config/typeorm";
import { RedisModule } from "./config/redis";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./auth/auth.module";
import { CommunityModule } from "./community/community.module";
import { RecordsModule } from "./running/records/records.module";
import { CoursesModule } from "./running/courses/courses.module";
import { CacheModule } from "@nestjs/cache-manager";
import { cacheOptionsFactory } from "./config/cache";
import { FilesModule } from "./files/files.module";
import Redis from "iovalkey";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, "..", ".env"),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: typeormOptionsFactory,
      dataSourceFactory: typeormDataSourceFactory,
      inject: [ConfigService],
    }),
    RedisModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: cacheOptionsFactory,
      inject: [Redis],
    }),
    HealthModule,
    AuthModule,
    CommunityModule,
    CoursesModule,
    RecordsModule,
    FilesModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
