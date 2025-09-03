import { Global, Module } from "@nestjs/common";
import Redis, { RedisOptions } from "iovalkey";
import { redisOptionsFactory } from "./redis.options.factory";
import { ConfigService } from "@nestjs/config";

export const REDIS_OPTIONS = Symbol("REDIS_OPTIONS");
export const REDIS_CLIENT = Symbol("REDIS_CLIENT");

@Global()
@Module({
  providers: [
    {
      provide: REDIS_OPTIONS,
      useFactory: redisOptionsFactory,
      inject: [ConfigService],
    },
    {
      provide: REDIS_CLIENT,
      useFactory: (options: RedisOptions) => new Redis(options),
      inject: [REDIS_OPTIONS],
    },
  ],
  exports: [REDIS_OPTIONS, REDIS_CLIENT],
})
export class RedisModule {}
