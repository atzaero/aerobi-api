import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { FindFeedbackByIdDocs } from '../docs/find-feedback-by-id.docs';
import { FeedbackParamDTO } from '../dtos/feedback-param.dto';
import { FeedbackResponseDTO } from '../dtos/feedback-response.dto';
import { FindFeedbackByIdService } from '../services/find-feedback-by-id.service';

@ApiTags('Feedbacks')
@Controller('feedbacks')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class FindFeedbackByIdController {
  constructor(private readonly service: FindFeedbackByIdService) {}

  @Get(':id')
  @RequirePermission('feedback', 'read')
  @RequiresGroupScope(GroupScopeSubject.FEEDBACK)
  @FindFeedbackByIdDocs()
  handle(@Param() { id }: FeedbackParamDTO): Promise<FeedbackResponseDTO> {
    return this.service.execute({ id });
  }
}
