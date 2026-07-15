import { Body, Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { buildAuditContext } from '@/modules/audit/utils/audit-context.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { UpdateGuessStatusDocs } from '../docs/update-guess-status.docs';
import { UpdateGuessStatusResponseDTO } from '../dtos/guess.dto';
import { GuessParamDTO } from '../dtos/guess-param.dto';
import { UpdateGuessStatusDTO } from '../dtos/update-guess-status.dto';
import { UpdateGuessStatusService } from '../services/update-guess-status.service';

@ApiTags('Guesses')
@Controller('guesses')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class UpdateGuessStatusController {
  constructor(private readonly service: UpdateGuessStatusService) {}

  @Patch(':id/status')
  @RequirePermission('task', 'update')
  @RequiresGroupScope(GroupScopeSubject.GUESS)
  @UpdateGuessStatusDocs()
  handle(
    @Param() { id }: GuessParamDTO,
    @Body() dto: UpdateGuessStatusDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<UpdateGuessStatusResponseDTO> {
    return this.service.execute(
      id,
      dto,
      actor,
      buildAuditContext(actor, request),
    );
  }
}
