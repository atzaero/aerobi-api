import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { buildAuditContext } from '@/modules/audit/utils/audit-context.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { CreateDocumentDocs } from '../docs/create-document.docs';
import { CreateDocumentDTO } from '../dtos/create-document.dto';
import { DocumentResponseDTO } from '../dtos/document-response.dto';
import { CreateDocumentService } from '../services/create-document.service';
import { MAX_DOCUMENT_BYTES } from '../utils/document-storage';

/**
 * `POST /documents` — upload genérico (8 tipos, qualquer mimetype, ≤10 MB). O
 * escopo por grupo do aeródromo é validado no service (o `aerodromeId` vem no
 * corpo, não em `:id`, então não há `GroupScopeGuard`).
 */
@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CreateDocumentController {
  constructor(private readonly service: CreateDocumentService) {}

  @Post()
  @RequirePermission('document', 'create')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_DOCUMENT_BYTES } }),
  )
  @CreateDocumentDocs()
  handle(
    @Body() dto: CreateDocumentDTO,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<DocumentResponseDTO> {
    return this.service.execute(
      dto,
      file,
      actor,
      buildAuditContext(actor, request),
    );
  }
}
