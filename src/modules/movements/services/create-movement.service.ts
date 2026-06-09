import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { StorageService } from '@/modules/storage/services/storage.service';

import { CreateMovementDTO } from '../dtos/create-movement.dto';
import { CreateMovementResponseDTO } from '../dtos/create-movement-response.dto';
import { buildMovementCreateInput } from '../mappers/movement.prisma.mapper';
import { MovementRepository } from '../repositories/movement.repository';
import {
  buildReadingImageKey,
  isAllowedImageMimetype,
} from '../utils/reading-image';
import { resolveReadingImageUrl } from '../utils/resolve-reading-image-url';

// Valor literal mantido por compatibilidade com o aviascan-api legado (o cliente
// Python só checa o status code, mas outros consumidores podem ler `message`).
const LEGACY_SUCCESS_MESSAGE = 'Reading registered successfully';

@Injectable()
export class CreateMovementService {
  private readonly logger = new Logger(CreateMovementService.name);

  constructor(
    private readonly repo: MovementRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    dto: CreateMovementDTO,
    image?: Express.Multer.File,
  ): Promise<CreateMovementResponseDTO> {
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
      image_path: await resolveReadingImageUrl(this.storage, imageKey),
    };
  }

  /**
   * Persiste a leitura. Se o INSERT falhar após a imagem já ter sido enviada,
   * compensa removendo o objeto do storage para não deixar lixo órfão.
   */
  private async persist(dto: CreateMovementDTO, imageKey: string | null) {
    try {
      return await this.repo.create(buildMovementCreateInput(dto, imageKey));
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
