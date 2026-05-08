import { Injectable } from '@nestjs/common';

import { PilotLicenseResponseDto } from '../dtos/pilot-license-response.dto';

@Injectable()
export class AnacCacheService {
  private readonly cacheMap = new Map<
    string,
    { data: PilotLicenseResponseDto; expiryTime: number }
  >();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos em ms

  getCache(key: string): PilotLicenseResponseDto | null {
    const record = this.cacheMap.get(key);
    if (!record) return null;

    if (Date.now() > record.expiryTime) {
      this.cacheMap.delete(key);
      return null;
    }

    return record.data;
  }

  setCache(key: string, data: PilotLicenseResponseDto): void {
    this.cacheMap.set(key, {
      data,
      expiryTime: Date.now() + this.CACHE_TTL,
    });
  }
}
