import { HttpStatus, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { BatchReadingItemDTO } from '../dtos/batch-reading-item.dto';
import { CreateAircraftReadingBatchResponseDTO } from '../dtos/create-aircraft-reading-batch.dto';
import { isAllowedImageMimetype } from '../utils/reading-image';
import { CreateAircraftReadingService } from './create-aircraft-reading.service';

@Injectable()
export class BatchCreateAircraftReadingService {
  constructor(
    private readonly createService: CreateAircraftReadingService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    metadata: string,
    images: Express.Multer.File[],
  ): Promise<CreateAircraftReadingBatchResponseDTO> {
    const items = await this.parseAndValidate(metadata, images);

    const results = await Promise.all(
      items.map(async (item) => {
        const image =
          item.image_index !== undefined ? images[item.image_index] : undefined;
        const created = await this.createService.execute(item, image);
        return { id: created.id, image_path: created.image_path };
      }),
    );

    return { created: results.length, items: results };
  }

  /**
   * Parseia `metadata` (JSON), valida cada item (class-validator) e confere os
   * `image_index` (range + mimetype) ANTES de processar — para falhar com 400
   * sem criar leituras parciais.
   */
  private async parseAndValidate(
    metadata: string,
    images: Express.Multer.File[],
  ): Promise<BatchReadingItemDTO[]> {
    let raw: unknown;
    try {
      raw = JSON.parse(metadata);
    } catch {
      throw this.badRequest('metadata deve ser um JSON válido');
    }
    if (!Array.isArray(raw)) {
      throw this.badRequest('metadata deve ser um array');
    }
    if (raw.length === 0) {
      throw this.badRequest('metadata não pode ser vazio');
    }

    const items = (raw as unknown[]).map((entry) =>
      plainToInstance(BatchReadingItemDTO, entry),
    );

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const errors = await validate(item);
      if (errors.length > 0) {
        throw this.badRequest(`item ${i} de metadata é inválido`);
      }
      if (item.image_index !== undefined) {
        if (item.image_index < 0 || item.image_index >= images.length) {
          throw this.badRequest(
            `image_index ${item.image_index} (item ${i}) fora do intervalo de images`,
          );
        }
        if (!isAllowedImageMimetype(images[item.image_index].mimetype)) {
          throw this.badRequest(
            `imagem do item ${i} deve ser jpg, png ou webp`,
          );
        }
      }
    }

    return items;
  }

  private badRequest(details: string): CustomHttpException {
    return new CustomHttpException(
      this.errorMessageService.getMessage(ErrorCode.VALIDATION_FAILED, {
        DETAILS: details,
      }),
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_FAILED,
    );
  }
}
