import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PrivateAerodromesApiKeyGuard } from '@/common/guards/private-aerodromes-api-key.guard';

import { SyncDocs } from '../docs/sync.docs';
import { SyncPrivateAerodromesDto } from '../dtos/sync-private-aerodromes.dto';
import { PrivateAerodromesSyncService } from '../services/private-aerodromes-sync.service';

@ApiTags('Private Aerodromes')
@Controller('private-aerodromes')
@UseGuards(PrivateAerodromesApiKeyGuard)
export class SyncController {
  constructor(private readonly sync: PrivateAerodromesSyncService) {}

  @Post('sync')
  @SyncDocs()
  handle(@Body() body: SyncPrivateAerodromesDto = {}) {
    return this.sync.execute(body);
  }
}
