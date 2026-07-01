import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ListAerodromeFeedbacksDocs } from '../docs/list-aerodrome-feedbacks.docs';
import { ListAerodromeFeedbacksQueryDTO } from '../dtos/list-aerodrome-feedbacks-query.dto';
import { AerodromeFeedbacksPaginatedResponseDTO } from '../dtos/aerodrome-feedbacks-paginated-response.dto';
import { ListAerodromeFeedbacksService } from '../services/list-aerodrome-feedbacks.service';

@ApiTags('Aerodrome Feedbacks')
@Controller('aerodrome-feedbacks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ListAerodromeFeedbacksController {
  constructor(private readonly service: ListAerodromeFeedbacksService) {}

  @Get()
  @RequirePermission('feedback', 'list')
  @ListAerodromeFeedbacksDocs()
  handle(
    @Query() query: ListAerodromeFeedbacksQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AerodromeFeedbacksPaginatedResponseDTO> {
    return this.service.execute(query, actor);
  }
}
