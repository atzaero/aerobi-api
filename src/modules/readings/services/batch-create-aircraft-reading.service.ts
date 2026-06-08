import { HttpStatus, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { BatchReadingItemDTO } from '../dtos/batch-reading-item.dto';
import {
  BatchReadingResultItemDTO,
  CreateAircraftReadingBatchResponseDTO,
} from '../dtos/create-aircraft-reading-batch.dto';
import { isAllowedImageMimetype } from '../utils/reading-image';
import { CreateAircraftReadingService } from './create-aircraft-reading.service';

/** Máximo de itens processados em paralelo (evita saturar o pool do DB/MinIO). */
const CONCURRENCY = 8;

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
    const results = await this.processInChunks(items, images);
    const created = results.filter((r) => r.status === 'created').length;
    return { created, failed: results.length - created, items: results };
  }

  /**
   * Processa os itens em chunks de `CONCURRENCY` (paralelismo limitado). Cada
   * item é independente: uma falha de runtime vira `status: 'failed'` no item
   * (não derruba o lote), para o cliente reenviar só os que falharam sem
   * duplicar os já criados. A compensação de imagem órfã de cada item é feita
   * pelo CreateAircraftReadingService.
   */
  private async processInChunks(
    items: BatchReadingItemDTO[],
    images: Express.Multer.File[],
  ): Promise<BatchReadingResultItemDTO[]> {
    const results: BatchReadingResultItemDTO[] = [];
    for (let start = 0; start < items.length; start += CONCURRENCY) {
      const chunk = items.slice(start, start + CONCURRENCY);
      const chunkResults = await Promise.all(
        chunk.map((item, offset) =>
          this.processItem(item, start + offset, images),
        ),
      );
      results.push(...chunkResults);
    }
    return results;
  }

  private async processItem(
    item: BatchReadingItemDTO,
    index: number,
    images: Express.Multer.File[],
  ): Promise<BatchReadingResultItemDTO> {
    const image =
      item.image_index !== undefined ? images[item.image_index] : undefined;
    try {
      const created = await this.createService.execute(item, image);
      return {
        index,
        status: 'created',
        id: created.id,
        image_path: created.image_path,
        error: null,
      };
    } catch (err) {
      return {
        index,
        status: 'failed',
        id: null,
        image_path: null,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Parseia `metadata` (JSON), valida cada item (class-validator) e confere os
   * `image_index` (range + mimetype) ANTES de processar — para falhar com 400
   * sem criar leituras quando a entrada é inválida.
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

    const items = raw.map((entry) =>
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
