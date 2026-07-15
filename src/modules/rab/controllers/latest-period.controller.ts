import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { LatestPeriodDocs } from '../docs/latest-period.docs';
import { AnacIndexService } from '../services/anac-index.service';

/**
 * `GET /rab/latest-period` — JWT + RBAC `rab:read`. Sem escopo por grupo (RAB
 * é dado aberto nacional da ANAC).
 */
@ApiTags('RAB')
@Controller('rab')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LatestPeriodController {
  constructor(private readonly index: AnacIndexService) {}

  @Get('latest-period')
  @RequirePermission('rab', 'read')
  @LatestPeriodDocs()
  async handle() {
    const period = await this.index.execute();
    return { period };
  }
}
