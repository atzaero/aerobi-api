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

import { CreateAircraftReadingBatchDocs } from '../docs/create-aircraft-reading-batch.docs';
import {
  CreateAircraftReadingBatchDTO,
  CreateAircraftReadingBatchResponseDTO,
} from '../dtos/create-aircraft-reading-batch.dto';
import { BatchCreateAircraftReadingService } from '../services/batch-create-aircraft-reading.service';
import { MAX_BATCH_FILES, MAX_IMAGE_SIZE_BYTES } from '../utils/reading-image';

@ApiTags('Readings')
@Controller('readings')
@UseGuards(AerobiApiKeyGuard)
export class BatchCreateAircraftReadingController {
  constructor(private readonly service: BatchCreateAircraftReadingService) {}

  @Post('batch')
  @UseInterceptors(
    FilesInterceptor('images', MAX_BATCH_FILES, {
      limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
    }),
  )
  @CreateAircraftReadingBatchDocs()
  handle(
    @Body() dto: CreateAircraftReadingBatchDTO,
    @UploadedFiles() images: Express.Multer.File[] = [],
  ): Promise<CreateAircraftReadingBatchResponseDTO> {
    return this.service.execute(dto.metadata, images);
  }
}
