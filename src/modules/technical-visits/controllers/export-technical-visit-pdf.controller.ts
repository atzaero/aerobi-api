import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { applyPdfDownloadHeaders } from '@/common/utils/pdf-download.util';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';

import { ExportTechnicalVisitPdfDocs } from '../docs/export-technical-visit-pdf.docs';
import { TechnicalVisitParamDTO } from '../dtos/technical-visit-param.dto';
import { ExportTechnicalVisitPdfService } from '../services/export-technical-visit-pdf.service';

@ApiTags('Technical Visits')
@Controller('technical-visits')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class ExportTechnicalVisitPdfController {
  constructor(private readonly service: ExportTechnicalVisitPdfService) {}

  @Get(':technicalVisitId/export')
  @RequirePermission('technical_visit', 'export')
  @RequiresGroupScope(GroupScopeSubject.TECHNICAL_VISIT, 'technicalVisitId')
  @ExportTechnicalVisitPdfDocs()
  async handle(
    @Param() params: TechnicalVisitParamDTO,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename } = await this.service.execute(
      params.technicalVisitId,
    );
    applyPdfDownloadHeaders(res, filename);
    res.send(buffer);
  }
}
