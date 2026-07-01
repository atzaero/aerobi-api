import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { FindAerodromeFeedbackByIdDocs } from '../docs/find-aerodrome-feedback-by-id.docs';
import { AerodromeFeedbackParamDTO } from '../dtos/aerodrome-feedback-param.dto';
import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import { FindAerodromeFeedbackByIdService } from '../services/find-aerodrome-feedback-by-id.service';

@ApiTags('Aerodrome Feedbacks')
@Controller('aerodrome-feedbacks')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class FindAerodromeFeedbackByIdController {
  constructor(private readonly service: FindAerodromeFeedbackByIdService) {}

  @Get(':id')
  @RequirePermission('feedback', 'read')
  @RequiresGroupScope(GroupScopeSubject.AERODROME_FEEDBACK)
  @FindAerodromeFeedbackByIdDocs()
  handle(
    @Param() { id }: AerodromeFeedbackParamDTO,
  ): Promise<AerodromeFeedbackResponseDTO> {
    return this.service.execute({ id });
  }
}
