import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { INestApplicationContext } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Cache } from 'cache-manager';
import { RedisStore } from 'cache-manager-redis-yet';
import { createClient } from 'redis';
import { ServerOptions } from 'socket.io';
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from './app.environment';

export class RedisIoAdapter extends IoAdapter {
  private readonly cacheManager: Cache<RedisStore>;
  private adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(appOrHttpServer?: INestApplicationContext | any) {
    super(appOrHttpServer);

    if (appOrHttpServer && appOrHttpServer instanceof NestApplication) {
      this.cacheManager = (appOrHttpServer as NestApplication).get(
        CACHE_MANAGER,
      );
    }
  }

  async connectToRedis(): Promise<void> {
    const pubClient = this.getPubClient();
    const subClient = pubClient.duplicate();
    await subClient.connect();
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }

  private getPubClient() {
    if (this.cacheManager && 'client' in this.cacheManager.store) {
      return (this.cacheManager.store as RedisStore).client;
    }

    return createClient({
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
      },
      password: REDIS_PASSWORD,
    });
  }
}
