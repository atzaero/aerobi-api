import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { PilotLicenseDocs } from '../docs/pilot-license.docs';
import { PilotLicenseQueryDto } from '../dtos/pilot-license-query.dto';
import { PilotLicenseResponseDto } from '../dtos/pilot-license-response.dto';
import { AnacHttpService } from '../services/anac-http.service';
import { AnacScraperService } from '../services/anac-scraper.service';
import { RateLimiterService } from '../services/rate-limiter.service';
import { AnacCacheService } from '../services/anac-cache.service';

@ApiTags('ANAC')
@Controller('anac/pilot-license')
@UseGuards(AerobiApiKeyGuard)
export class PilotLicenseController {
  constructor(
    private readonly anacHttpService: AnacHttpService,
    private readonly anacScraperService: AnacScraperService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly anacCacheService: AnacCacheService,
  ) {}

  @Get()
  @PilotLicenseDocs()
  async handle(
    @Query() query: PilotLicenseQueryDto,
    @Req() req: Request,
  ): Promise<PilotLicenseResponseDto> {
    // Rate limiting
    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      (req.headers['x-real-ip'] as string) ||
      'unknown';
    if (!this.rateLimiterService.checkRateLimit(ip)) {
      throw new HttpException(
        'Muitas requisições. Tente novamente em alguns minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Verificar cache
    const cacheKey = `cpf-${query.cpf}-canac-${query.canac}`;
    const cachedData = this.anacCacheService.getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Buscar dados da ANAC
    const html = await this.anacHttpService.fetchLicenseData(
      query.cpf,
      query.canac,
    );

    // Processar HTML
    const result = await this.anacScraperService.scrapeLicenseData(
      html,
      query.canac,
    );

    // Salvar no cache
    this.anacCacheService.setCache(cacheKey, result);

    return result;
  }
}
