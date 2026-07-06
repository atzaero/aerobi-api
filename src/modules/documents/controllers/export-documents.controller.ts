import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { applyCsvDownloadHeaders } from '@/common/utils/csv-download.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ExportDocumentsDocs } from '../docs/export-documents.docs';
import { ExportDocumentsQueryDTO } from '../dtos/export-documents-query.dto';
import { ExportDocumentsService } from '../services/export-documents.service';

/**
 * `GET /documents/export` — CSV. Registrado **antes** do
 * `FindDocumentByIdController` no módulo (Express 5), senão `export` cai no
 * handler de `:id`. Escopo por grupo aplicado no service.
 */
@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportDocumentsController {
  constructor(private readonly service: ExportDocumentsService) {}

  @Get('export')
  @RequirePermission('document', 'export')
  @ExportDocumentsDocs()
  async handle(
    @Query() query: ExportDocumentsQueryDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const { csv, truncated, total } = await this.service.execute(query, actor);
    const date = new Date().toISOString().slice(0, 10);
    applyCsvDownloadHeaders(res, `documentos-${date}.csv`, {
      truncated,
      total,
    });
    return csv;
  }
}
