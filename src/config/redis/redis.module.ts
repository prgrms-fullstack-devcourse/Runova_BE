import { Global, Module } from "@nestjs/common";
import Redis from "iovalkey";
import { redisFactory } from "./redis.factory";
import { ConfigService } from "@nestjs/config";

@Global()
@Module({
  providers: [
    {
      provide: Redis,
      useFactory: redisFactory,
      inject: [ConfigService],
    },
  ],
  exports: [Redis],
})
export class RedisModule {}