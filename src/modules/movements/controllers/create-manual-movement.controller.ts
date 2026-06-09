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

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { CreateManualMovementDocs } from '../docs/create-manual-movement.docs';
import { CreateManualMovementDTO } from '../dtos/create-manual-movement.dto';
import { CreateMovementResponseDTO } from '../dtos/create-movement-response.dto';
import { CreateMovementService } from '../services/create-movement.service';
import { MAX_IMAGE_SIZE_BYTES } from '../utils/reading-image';

/**
 * Criação MANUAL de movimentos pela interface humana (`POST /movements`).
 * Path distinto do legado `/readings` (ingestão automática), mas reaproveita o
 * mesmo `CreateMovementService` (fonte única de criação). Ainda protegido por
 * `AerobiApiKeyGuard` — sem JWT humano por ora (ver AGENTS.md).
 */
@ApiTags('Movements')
@Controller('movements')
@UseGuards(AerobiApiKeyGuard)
export class CreateManualMovementController {
  constructor(private readonly service: CreateMovementService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: MAX_IMAGE_SIZE_BYTES } }),
  )
  @CreateManualMovementDocs()
  handle(
    @Body() dto: CreateManualMovementDTO,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<CreateMovementResponseDTO> {
    // Origem MANUAL: `operationType` vem do formulário; `createdBy` do corpo
    // (temporário, até a auth humana — ver AGENTS.md). `confidence` fica null.
    return this.service.execute(
      dto,
      {
        source: MovementSource.MANUAL,
        createdBy: dto.createdBy ?? null,
        operationType: dto.operationType,
      },
      image,
    );
  }
}
