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

import { UpdateDocumentDocs } from '../docs/update-document.docs';
import { DocumentParamDTO } from '../dtos/document-param.dto';
import { DocumentResponseDTO } from '../dtos/document-response.dto';
import { UpdateDocumentDTO } from '../dtos/update-document.dto';
import { UpdateDocumentService } from '../services/update-document.service';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class UpdateDocumentController {
  constructor(private readonly service: UpdateDocumentService) {}

  @Patch(':id')
  @RequirePermission('document', 'update')
  @RequiresGroupScope(GroupScopeSubject.DOCUMENT)
  @UpdateDocumentDocs()
  handle(
    @Param() { id }: DocumentParamDTO,
    @Body() dto: UpdateDocumentDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<DocumentResponseDTO> {
    return this.service.execute(
      id,
      dto,
      actor,
      buildAuditContext(actor, request),
    );
  }
}
