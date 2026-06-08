import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { StorageService } from '@/modules/storage/services/storage.service';

import { CreateAircraftReadingDTO } from '../dtos/create-aircraft-reading.dto';
import { CreateAircraftReadingResponseDTO } from '../dtos/create-aircraft-reading-response.dto';
import { buildAircraftReadingCreateInput } from '../mappers/aircraft-reading.prisma.mapper';
import { AircraftReadingRepository } from '../repositories/aircraft-reading.repository';
import {
  buildReadingImageKey,
  isAllowedImageMimetype,
} from '../utils/reading-image';

@Injectable()
export class CreateAircraftReadingService {
  constructor(
    private readonly repo: AircraftReadingRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    dto: CreateAircraftReadingDTO,
    image?: Express.Multer.File,
  ): Promise<CreateAircraftReadingResponseDTO> {
    let imageKey: string | null = null;

    if (image) {
      this.assertImageMimetype(image.mimetype);
      imageKey = buildReadingImageKey(image.mimetype, dto.reading_datetime);
      await this.storage.upload(image, imageKey);
    }

    const created = await this.repo.create(
      buildAircraftReadingCreateInput(dto, imageKey),
    );

    const imagePath = imageKey
      ? await this.storage.getPresignedUrl(imageKey)
      : null;

    return {
      id: created.id,
      message: 'Reading created successfully',
      image_path: imagePath,
    };
  }

  private assertImageMimetype(mimetype: string): void {
    if (!isAllowedImageMimetype(mimetype)) {
      throw new CustomHttpException(
        this.errorMessageService.getMessage(ErrorCode.VALIDATION_FAILED, {
          DETAILS: 'a imagem deve ser jpg, png ou webp',
        }),
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_FAILED,
      );
    }
  }
}
