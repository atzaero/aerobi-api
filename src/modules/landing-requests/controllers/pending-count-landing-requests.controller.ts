import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { PendingCountLandingRequestsDocs } from '../docs/pending-count-landing-requests.docs';
import { PendingCountResponseDTO } from '../dtos/pending-count-response.dto';
import { PendingCountLandingRequestsService } from '../services/pending-count-landing-requests.service';

/**
 * `GET /landing-requests/pending-count` — contagem de pendentes no escopo do
 * ator (polling). Registrado **antes** do `FindLandingRequestByIdController`
 * (Express 5). Interno (JWT + `landing_request:list`).
 */
@ApiTags('Landing Requests')
@Controller('landing-requests')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PendingCountLandingRequestsController {
  constructor(private readonly service: PendingCountLandingRequestsService) {}

  @Get('pending-count')
  @RequirePermission('landing_request', 'list')
  @PendingCountLandingRequestsDocs()
  handle(
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<PendingCountResponseDTO> {
    return this.service.execute(actor);
  }
}
