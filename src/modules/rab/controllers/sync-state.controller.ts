import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UserRole } from '@/generated/prisma/client';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';

import { SyncStateDocs } from '../docs/sync-state.docs';
import { RabSyncStateService } from '../services/rab-sync-state.service';

/**
 * `GET /rab/sync-state` — operação administrativa: JWT + `@Roles(ADMIN)`. Sem
 * escopo por grupo (RAB é dado aberto nacional).
 */
@ApiTags('RAB')
@Controller('rab')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SyncStateController {
  constructor(private readonly syncStateService: RabSyncStateService) {}

  @Get('sync-state')
  @Roles(UserRole.ADMIN)
  @SyncStateDocs()
  handle() {
    return this.syncStateService.execute();
  }
}
