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

import { RemoveDocumentDocs } from '../docs/remove-document.docs';
import { DocumentParamDTO } from '../dtos/document-param.dto';
import { DocumentResponseDTO } from '../dtos/document-response.dto';
import { RemoveDocumentService } from '../services/remove-document.service';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class RemoveDocumentController {
  constructor(private readonly service: RemoveDocumentService) {}

  @Delete(':id')
  @RequirePermission('document', 'delete')
  @RequiresGroupScope(GroupScopeSubject.DOCUMENT)
  @RemoveDocumentDocs()
  handle(
    @Param() { id }: DocumentParamDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<DocumentResponseDTO> {
    return this.service.execute(id, actor, buildAuditContext(actor, request));
  }
}
