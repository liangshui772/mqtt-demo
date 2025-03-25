import Redis from "ioredis";
import config from "./config";

export class RedisFlightWindow {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      maxRetriesPerRequest: 3
    });
  }

  async push(data: any): Promise<boolean> {
    try {
      const currentSize = await this.client.llen(config.redis.windowKey);
      if (currentSize >= config.redis.maxSize) {
        await this.client.lpop(config.redis.windowKey);
      }
      await this.client.rpush(config.redis.windowKey, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error("Redis push error:", err);
      return false;
    }
  }

  async pop(): Promise<any | null> {
    try {
      const data = await this.client.lpop(config.redis.windowKey);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error("Redis pop error:", err);
      return null;
    }
  }

  async size(): Promise<number> {
    return await this.client.llen(config.redis.windowKey);
  }
}