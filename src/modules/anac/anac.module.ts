import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { PilotLicenseController } from './controllers/pilot-license.controller';
import { AnacHttpService } from './services/anac-http.service';
import { AnacScraperService } from './services/anac-scraper.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { AnacCacheService } from './services/anac-cache.service';

@Module({
  imports: [HttpModule],
  controllers: [PilotLicenseController],
  providers: [
    AnacHttpService,
    AnacScraperService,
    RateLimiterService,
    AnacCacheService,
  ],
})
export class AnacModule {}
