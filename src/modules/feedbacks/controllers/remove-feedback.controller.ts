import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { RemoveFeedbackDocs } from '../docs/remove-feedback.docs';
import { FeedbackParamDTO } from '../dtos/feedback-param.dto';
import { FeedbackResponseDTO } from '../dtos/feedback-response.dto';
import { RemoveFeedbackService } from '../services/remove-feedback.service';

@ApiTags('Feedbacks')
@Controller('feedbacks')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class RemoveFeedbackController {
  constructor(private readonly service: RemoveFeedbackService) {}

  @Delete(':id')
  @RequirePermission('feedback', 'delete')
  @RequiresGroupScope(GroupScopeSubject.FEEDBACK)
  @RemoveFeedbackDocs()
  handle(
    @Param() { id }: FeedbackParamDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<FeedbackResponseDTO> {
    return this.service.execute({ id, deletedBy: actor.id });
  }
}
