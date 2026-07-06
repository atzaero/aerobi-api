import { Controller, Delete, Param, Req, UseGuards } from '@nestjs/common';
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

import { RemoveGuessDocs } from '../docs/remove-guess.docs';
import { RemoveGuessResponseDTO } from '../dtos/guess.dto';
import { GuessParamDTO } from '../dtos/guess-param.dto';
import { RemoveGuessService } from '../services/remove-guess.service';

@ApiTags('Guesses')
@Controller('guesses')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class RemoveGuessController {
  constructor(private readonly service: RemoveGuessService) {}

  @Delete(':id')
  @RequirePermission('task', 'delete')
  @RequiresGroupScope(GroupScopeSubject.GUESS)
  @RemoveGuessDocs()
  handle(
    @Param() { id }: GuessParamDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<RemoveGuessResponseDTO> {
    return this.service.execute(id, actor, buildAuditContext(actor, request));
  }
}
