import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { buildAuditContext } from '@/modules/audit/utils/audit-context.util';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { RequiresGroupScope } from '@/modules/auth/decorators/requires-group-scope.decorator';
import { GroupScopeGuard } from '@/modules/auth/guards/group-scope.guard';
import { GroupScopeSubject } from '@/modules/auth/guards/group-scope.subject';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { GenerateGeojsonDocs } from '../docs/generate-geojson.docs';
import { GeojsonParamDTO } from '../dtos/geojson-param.dto';
import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';
import { GeojsonMapper } from '../mappers/geojson.mapper';
import { GenerateGeojsonService } from '../services/generate-geojson.service';
import { assertGeojsonSourceFile } from '../utils/assert-geojson-source-file';
import { MAX_GEOJSON_SOURCE_SIZE_BYTES } from '../utils/geojson.constants';

/**
 * (Re)geração admin do GeoJSON de um aeródromo a partir de um KML/KMZ
 * (multipart, campo `file`). Best-effort: converte, deriva status READY/ERROR e
 * faz upsert por aeródromo; devolve o registro resultante. O param `id` é o
 * `aerodromeId` (escopo `AERODROME`). Enquanto `documents` (#366) não existe,
 * este endpoint destrava/testa a geração; o `GenerateGeojsonService` também é
 * exportado para o #366 consumir.
 */
@ApiTags('Geojsons')
@Controller('geojsons')
@UseGuards(JwtAuthGuard, PermissionsGuard, GroupScopeGuard)
export class GenerateGeojsonController {
  constructor(
    private readonly service: GenerateGeojsonService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  @Post('aerodrome/:id/generate')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('aerodrome', 'update')
  @RequiresGroupScope(GroupScopeSubject.AERODROME)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_GEOJSON_SOURCE_SIZE_BYTES },
    }),
  )
  @GenerateGeojsonDocs()
  async handle(
    @Param() { id }: GeojsonParamDTO,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<GeojsonResponseDTO> {
    const { fileType, buffer } = assertGeojsonSourceFile(
      file,
      this.errorMessageService,
    );

    const result = await this.service.execute(
      { aerodromeId: id, fileType, buffer, actorId: actor.id },
      buildAuditContext(actor, request),
    );

    if (!result.geojson) {
      throw resourceNotFound(this.errorMessageService, 'Aeródromo', id);
    }

    return GeojsonMapper.toApiRow(result.geojson);
  }
}
