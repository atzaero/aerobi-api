import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { FindDocumentByIdDocs } from '../docs/find-document-by-id.docs';
import { DocumentParamDTO } from '../dtos/document-param.dto';
import { DocumentResponseDTO } from '../dtos/document-response.dto';
import { FindDocumentByIdService } from '../services/find-document-by-id.service';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class FindDocumentByIdController {
  constructor(private readonly service: FindDocumentByIdService) {}

  @Get(':id')
  @RequirePermission('document', 'read')
  @RequiresGroupScope(GroupScopeSubject.DOCUMENT)
  @FindDocumentByIdDocs()
  handle(@Param() { id }: DocumentParamDTO): Promise<DocumentResponseDTO> {
    return this.service.execute({ id });
  }
}
