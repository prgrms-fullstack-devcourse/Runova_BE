import { Module } from "@nestjs/common";
import { join } from "node:path";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  typeormDataSourceFactory,
  typeormOptionsFactory,
} from "./config/typeorm";
// import { RedisModule } from "./config/redis";
import { HealthModule } from "./health/health.module";
import { AuthModule } from './auth/auth.module';

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
    // RedisModule,
    HealthModule,
    AuthModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
