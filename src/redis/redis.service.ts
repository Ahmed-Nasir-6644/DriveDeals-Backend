import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
@Injectable()
export class RedisService {
  private client: Redis;
  constructor(private configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST') || 'localhost',
      port: this.configService.get<number>('REDIS_PORT') || 6379,
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });
  }

  async set(key: string, value: string, ttl: number) {
    //ttl is in seconds
    await this.client.set(key, value, 'EX', ttl); //EX sets expiration
  }

  async get(key: string){
    return await this.client.get(key);
  }

  async del(key: string){
    await this.client.del(key);
  }
}
