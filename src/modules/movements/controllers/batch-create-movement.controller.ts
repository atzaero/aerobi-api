import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { CreateMovementBatchDocs } from '../docs/create-movement-batch.docs';
import {
  CreateMovementBatchDTO,
  CreateMovementBatchResponseDTO,
} from '../dtos/create-movement-batch.dto';
import { BatchCreateMovementService } from '../services/batch-create-movement.service';
import { MAX_BATCH_FILES, MAX_IMAGE_SIZE_BYTES } from '../utils/reading-image';

@ApiTags('Readings')
@Controller('readings')
@UseGuards(AerobiApiKeyGuard)
export class BatchCreateMovementController {
  constructor(private readonly service: BatchCreateMovementService) {}

  @Post('batch')
  @UseInterceptors(
    FilesInterceptor('images', MAX_BATCH_FILES, {
      limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
    }),
  )
  @CreateMovementBatchDocs()
  handle(
    @Body() dto: CreateMovementBatchDTO,
    @UploadedFiles() images: Express.Multer.File[] = [],
  ): Promise<CreateMovementBatchResponseDTO> {
    return this.service.execute(dto.metadata, images);
  }
}
