import Redis from "ioredis";
import { Logger } from "@common/lib/logger";
import Env from "@common/config/env.config";
import type { ICacheManager } from "@/common/providers/cache/ICacheManager";

export class CacheManager implements ICacheManager {
    private client: Redis;

    constructor() {
        if (Env.NODE_ENV === "test") {
            this.client = {} as unknown as Redis;
        } else {
            this.client = new Redis({
                host: Env.REDIS_HOST,
                port: Env.REDIS_PORT,
                password: Env.REDIS_PASSWORD,
            });
        }
    }

    public async set(key: string, value: string, ttl: number) {
        try {
            await this.client.set(key, value, "EX", ttl);
        } catch (error) {
            Logger.Error("Failed to set cache:", { error });
        }
    }

    public async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (error) {
            Logger.Error("Failed to get cache:", { error });
            return null;
        }
    }

    public async delete(key: string) {
        try {
            await this.client.del(key);
        } catch (error) {
            Logger.Error("Failed to delete cache:", { error });
        }
    }

    public async clear() {
        try {
            await this.client.flushdb();
        } catch (error) {
            Logger.Error("Failed to clear cache:", { error });
        }
    }

    public async exists(key: string): Promise<boolean> {
        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            Logger.Error("Failed to check cache existence:", { error });
            return false;
        }
    }

    public async getAllKeys(): Promise<string[]> {
        try {
            return await this.client.keys("*");
        } catch (error) {
            Logger.Error("Failed to get all keys from cache:", { error });
            return [];
        }
    }
}
