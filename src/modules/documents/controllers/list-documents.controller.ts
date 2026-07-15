import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ListDocumentsDocs } from '../docs/list-documents.docs';
import { ListDocumentsQueryDTO } from '../dtos/list-documents-query.dto';
import { DocumentsPaginatedResponseDTO } from '../dtos/documents-paginated-response.dto';
import { ListDocumentsService } from '../services/list-documents.service';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ListDocumentsController {
  constructor(private readonly service: ListDocumentsService) {}

  @Get()
  @RequirePermission('document', 'list')
  @ListDocumentsDocs()
  handle(
    @Query() query: ListDocumentsQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<DocumentsPaginatedResponseDTO> {
    return this.service.execute(query, actor);
  }
}
