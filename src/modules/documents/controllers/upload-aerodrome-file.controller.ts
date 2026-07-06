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

import { UploadAerodromeFileDocs } from '../docs/upload-aerodrome-file.docs';
import { DocumentResponseDTO } from '../dtos/document-response.dto';
import { UploadAerodromeFileDTO } from '../dtos/upload-aerodrome-file.dto';
import { UploadAerodromeFileService } from '../services/upload-aerodrome-file.service';
import { MAX_AERODROME_FILE_BYTES } from '../utils/aerodrome-file';

/**
 * `POST /documents/aerodrome-file` — upload dedicado (kml/image), gate
 * `aerodrome:update` (create/update compartilham as mesmas roles na matriz; o
 * `mode` só distingue a ação da auditoria). Escopo validado no service (o
 * `aerodromeId` vem no corpo). Registrado antes de `/:id` no módulo.
 */
@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UploadAerodromeFileController {
  constructor(private readonly service: UploadAerodromeFileService) {}

  @Post('aerodrome-file')
  @RequirePermission('aerodrome', 'update')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_AERODROME_FILE_BYTES } }),
  )
  @UploadAerodromeFileDocs()
  handle(
    @Body() dto: UploadAerodromeFileDTO,
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
