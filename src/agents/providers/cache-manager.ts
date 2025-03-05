import { ICacheManager } from '@elizaos/core';
import NodeCache from 'node-cache';
import * as path from 'path';

const cacheTimeSeconds = 30;

export class CacheManager {
  protected cache: NodeCache;

  constructor(
    protected cacheKey: string,
    protected cacheManager: ICacheManager,
  ) {
    this.cache = new NodeCache({ stdTTL: cacheTimeSeconds }); // Cache TTL set to 5 minutes
  }

  protected async readFromCache<T>(key: string): Promise<T | null> {
    const cached = await this.cacheManager.get<T>(
      path.join(this.cacheKey, key),
    );
    return cached;
  }

  protected async writeToCache<T>(key: string, data: T): Promise<void> {
    await this.cacheManager.set(path.join(this.cacheKey, key), data, {
      expires: Date.now() + cacheTimeSeconds * 1000,
    });
  }

  protected async getCachedData<T>(key: string): Promise<T | null> {
    // Check in-memory cache first
    const cachedData = this.cache.get<T>(key);
    if (cachedData) {
      return cachedData;
    }

    // Check file-based cache
    const fileCachedData = await this.readFromCache<T>(key);
    if (fileCachedData) {
      // Populate in-memory cache
      this.cache.set(key, fileCachedData);
      return fileCachedData;
    }

    return null;
  }

  protected async setCachedData<T>(cacheKey: string, data: T): Promise<void> {
    // Set in-memory cache
    this.cache.set(cacheKey, data);

    // Write to file-based cache
    await this.writeToCache(cacheKey, data);
  }
}
