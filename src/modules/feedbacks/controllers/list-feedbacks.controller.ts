import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ListFeedbacksDocs } from '../docs/list-feedbacks.docs';
import { ListFeedbacksQueryDTO } from '../dtos/list-feedbacks-query.dto';
import { FeedbacksPaginatedResponseDTO } from '../dtos/feedbacks-paginated-response.dto';
import { ListFeedbacksService } from '../services/list-feedbacks.service';

@ApiTags('Feedbacks')
@Controller('feedbacks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ListFeedbacksController {
  constructor(private readonly service: ListFeedbacksService) {}

  @Get()
  @RequirePermission('feedback', 'list')
  @ListFeedbacksDocs()
  handle(
    @Query() query: ListFeedbacksQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<FeedbacksPaginatedResponseDTO> {
    return this.service.execute(query, actor);
  }
}
