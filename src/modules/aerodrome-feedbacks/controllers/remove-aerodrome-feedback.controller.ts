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

import { RemoveAerodromeFeedbackDocs } from '../docs/remove-aerodrome-feedback.docs';
import { AerodromeFeedbackParamDTO } from '../dtos/aerodrome-feedback-param.dto';
import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { RemoveAerodromeFeedbackService } from '../services/remove-aerodrome-feedback.service';

@ApiTags('Aerodrome Feedbacks')
@Controller('aerodrome-feedbacks')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class RemoveAerodromeFeedbackController {
  constructor(private readonly service: RemoveAerodromeFeedbackService) {}

  @Delete(':id')
  @RequirePermission('feedback', 'delete')
  @RequiresGroupScope(GroupScopeSubject.AERODROME_FEEDBACK)
  @RemoveAerodromeFeedbackDocs()
  handle(
    @Param() { id }: AerodromeFeedbackParamDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AerodromeFeedbackResponseDTO> {
    return this.service.execute({ id, deletedBy: actor.id });
  }
}
