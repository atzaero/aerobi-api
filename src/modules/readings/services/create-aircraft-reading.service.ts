import { HttpStatus, Injectable, Logger } from '@nestjs/common';

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

// Valor literal mantido por compatibilidade com o aviascan-api legado (o cliente
// Python só checa o status code, mas outros consumidores podem ler `message`).
const LEGACY_SUCCESS_MESSAGE = 'Reading registered successfully';

@Injectable()
export class CreateAircraftReadingService {
  private readonly logger = new Logger(CreateAircraftReadingService.name);

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

    const created = await this.persist(dto, imageKey);

    return {
      id: created.id,
      message: LEGACY_SUCCESS_MESSAGE,
      image_path: await this.resolveImageUrl(imageKey),
    };
  }

  /**
   * Persiste a leitura. Se o INSERT falhar após a imagem já ter sido enviada,
   * compensa removendo o objeto do storage para não deixar lixo órfão.
   */
  private async persist(
    dto: CreateAircraftReadingDTO,
    imageKey: string | null,
  ) {
    try {
      return await this.repo.create(
        buildAircraftReadingCreateInput(dto, imageKey),
      );
    } catch (err) {
      if (imageKey) {
        await this.storage.delete(imageKey).catch((delErr: unknown) => {
          const msg = delErr instanceof Error ? delErr.message : String(delErr);
          this.logger.warn(
            `Falha ao limpar imagem órfã ${imageKey} após erro no create: ${msg}`,
          );
        });
      }
      throw err;
    }
  }

  /**
   * Resolve a presigned URL como best-effort: o registro já foi persistido, então
   * uma falha aqui não deve derrubar a operação (evita que o cliente reenvie e
   * duplique a leitura). Retorna `null` e loga em caso de falha.
   */
  private async resolveImageUrl(
    imageKey: string | null,
  ): Promise<string | null> {
    if (!imageKey) {
      return null;
    }
    try {
      return await this.storage.getPresignedUrl(imageKey);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Falha ao gerar presigned URL de ${imageKey}: ${msg}`);
      return null;
    }
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
