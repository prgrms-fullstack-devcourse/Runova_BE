import { Global, Module } from "@nestjs/common";
import Redis, { RedisOptions } from "iovalkey";
import { redisOptionsFactory } from "./redis.options.factory";
import { ConfigService } from "@nestjs/config";

export const REDIS_OPTIONS = Symbol("REDIS_OPTIONS");

@Global()
@Module({
  providers: [
    {
      provide: REDIS_OPTIONS,
      useFactory: redisOptionsFactory,
      inject: [ConfigService],
    },
    {
      provide: Redis,
      useFactory: (options: RedisOptions) => new Redis(options),
      inject: [REDIS_OPTIONS],
    }
  ],
  exports: [REDIS_OPTIONS, Redis],
})
export class RedisModule {}