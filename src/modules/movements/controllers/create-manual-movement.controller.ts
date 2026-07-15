import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { MovementSource } from '@/generated/prisma/enums';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/modules/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { CreateManualMovementDocs } from '../docs/create-manual-movement.docs';
import { CreateManualMovementDTO } from '../dtos/create-manual-movement.dto';
import { CreateMovementResponseDTO } from '../dtos/create-movement-response.dto';
import { CreateMovementService } from '../services/create-movement.service';
import { MovementScopeService } from '../services/movement-scope.service';
import { MAX_IMAGE_SIZE_BYTES } from '../utils/reading-image';

/**
 * Criação MANUAL de movimentos pela interface humana (`POST /movements`). JWT +
 * RBAC `movement:create`; reaproveita o `CreateMovementService` (fonte única de
 * criação, compartilhada com a ingestão automática). O `createdBy` deriva do
 * ator autenticado e o coordinator só cria para aeródromos do próprio grupo
 * (escopo por ICAO).
 */
@ApiTags('Movements')
@Controller('movements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CreateManualMovementController {
  constructor(
    private readonly service: CreateMovementService,
    private readonly scopeService: MovementScopeService,
  ) {}

  @Post()
  @RequirePermission('movement', 'create')
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: MAX_IMAGE_SIZE_BYTES } }),
  )
  @CreateManualMovementDocs()
  async handle(
    @Body() dto: CreateManualMovementDTO,
    @CurrentUser() actor: AuthenticatedUser,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<CreateMovementResponseDTO> {
    await this.scopeService.assertIcaoInScope(dto.aerodrome, actor);
    return this.service.execute(
      dto,
      {
        source: MovementSource.MANUAL,
        createdBy: actor.id,
        operationType: dto.operationType,
      },
      image,
    );
  }
}
