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

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';

import { CreateMovementDocs } from '../docs/create-movement.docs';
import { CreateMovementDTO } from '../dtos/create-movement.dto';
import { CreateMovementResponseDTO } from '../dtos/create-movement-response.dto';
import { CreateMovementService } from '../services/create-movement.service';
import { MAX_IMAGE_SIZE_BYTES } from '../utils/reading-image';

@ApiTags('Readings')
@Controller('readings')
@UseGuards(AerobiApiKeyGuard)
export class CreateMovementController {
  constructor(private readonly service: CreateMovementService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: MAX_IMAGE_SIZE_BYTES } }),
  )
  @CreateMovementDocs()
  handle(
    @Body() dto: CreateMovementDTO,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<CreateMovementResponseDTO> {
    return this.service.execute(dto, image);
  }
}
