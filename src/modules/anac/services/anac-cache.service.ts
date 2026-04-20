import { Injectable } from '@nestjs/common';

@Injectable()
export class AnacCacheService {
  private readonly cacheMap = new Map<
    string,
    { data: any; expiryTime: number }
  >();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos em ms

  getCache(key: string): any | null {
    const record = this.cacheMap.get(key);
    if (!record) return null;

    if (Date.now() > record.expiryTime) {
      this.cacheMap.delete(key);
      return null;
    }

    return record.data;
  }

  setCache(key: string, data: any): void {
    this.cacheMap.set(key, {
      data,
      expiryTime: Date.now() + this.CACHE_TTL,
    });
  }
}
