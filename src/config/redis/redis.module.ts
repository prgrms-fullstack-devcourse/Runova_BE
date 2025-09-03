import { Global, Module } from "@nestjs/common";
import Redis from "iovalkey";
import { ConfigService } from "@nestjs/config";
import { redisFactory } from "./redis.factory";

@Global()
@Module({
  providers: [
    {
      provide: Redis,
      useFactory: redisFactory,
      inject: [ConfigService],
    }
  ],
  exports: [Redis],
})
export class RedisModule {}