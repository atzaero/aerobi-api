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

import { CreateAircraftReadingDocs } from '../docs/create-aircraft-reading.docs';
import { CreateAircraftReadingDTO } from '../dtos/create-aircraft-reading.dto';
import { CreateAircraftReadingResponseDTO } from '../dtos/create-aircraft-reading-response.dto';
import { CreateAircraftReadingService } from '../services/create-aircraft-reading.service';
import { MAX_IMAGE_SIZE_BYTES } from '../utils/reading-image';

@ApiTags('Readings')
@Controller('readings')
@UseGuards(AerobiApiKeyGuard)
export class CreateAircraftReadingController {
  constructor(private readonly service: CreateAircraftReadingService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: MAX_IMAGE_SIZE_BYTES } }),
  )
  @CreateAircraftReadingDocs()
  handle(
    @Body() dto: CreateAircraftReadingDTO,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<CreateAircraftReadingResponseDTO> {
    return this.service.execute(dto, image);
  }
}
