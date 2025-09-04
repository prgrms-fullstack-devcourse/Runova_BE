import Redis from "iovalkey";
import Keyv from "keyv";
import KeyvValkey from "@keyv/valkey";
import { CacheOptions } from "@nestjs/cache-manager";

export function cacheOptionsFactory(redis: Redis): CacheOptions {
  const store = new KeyvValkey(redis);
  return { stores: [new Keyv({ store })] };
}
