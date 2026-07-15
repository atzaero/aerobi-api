import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UserRole } from '@/generated/prisma/client';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';

import { SyncDocs } from '../docs/sync.docs';
import { SyncRabDto } from '../dtos/sync-rab.dto';
import { RabSyncService } from '../services/rab-sync.service';

/**
 * `POST /rab/sync` — operação administrativa (dispara o ETL RAB): JWT +
 * `@Roles(ADMIN)`. Sem escopo por grupo (RAB é dado aberto nacional).
 */
@ApiTags('RAB')
@Controller('rab')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SyncController {
  constructor(private readonly rabSync: RabSyncService) {}

  @Post('sync')
  @Roles(UserRole.ADMIN)
  @SyncDocs()
  handle(@Body() body: SyncRabDto = {}) {
    return this.rabSync.execute(body);
  }
}
