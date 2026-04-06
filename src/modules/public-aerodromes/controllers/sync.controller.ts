import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { SyncDocs } from '../docs/sync.docs';
import { SyncPublicAerodromesDto } from '../dtos/sync-public-aerodromes.dto';
import { PublicAerodromesSyncService } from '../services/public-aerodromes-sync.service';

@ApiTags('Public Aerodromes')
@Controller('public-aerodromes')
@UseGuards(AerobiApiKeyGuard)
export class SyncController {
  constructor(private readonly sync: PublicAerodromesSyncService) {}

  @Post('sync')
  @SyncDocs()
  handle(@Body() body: SyncPublicAerodromesDto = {}) {
    return this.sync.execute(body);
  }
}
