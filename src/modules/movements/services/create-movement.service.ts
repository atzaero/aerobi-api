import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { RabRowRepository } from '@/modules/rab/repositories/rab-row.repository';
import { StorageService } from '@/modules/storage/services/storage.service';

import { CreateMovementResponseDTO } from '../dtos/create-movement-response.dto';
import { buildAircraftSnapshotCreateInput } from '../mappers/aircraft-snapshot.prisma.mapper';
import {
  buildMovementCreateInput,
  type MovementCreateData,
} from '../mappers/movement.prisma.mapper';
import { MovementRepository } from '../repositories/movement.repository';
import {
  buildReadingImageKey,
  isAllowedImageMimetype,
} from '../utils/reading-image';
import { resolveReadingImageUrl } from '../utils/resolve-reading-image-url';
import type { MovementOrigin } from './movement-origin';

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
    private readonly rabRowRepo: RabRowRepository,
  ) {}

  async execute(
    dto: MovementCreateData,
    origin: MovementOrigin,
    image?: Express.Multer.File,
  ): Promise<CreateMovementResponseDTO> {
    // Valida o mimetype antes de qualquer efeito colateral (fail-fast).
    if (image) {
      this.assertImageMimetype(image.mimetype);
    }

    // Congela um snapshot dos dados RAB da aeronave no instante do movimento.
    // A `rab_row` é periódica; sem match a matrícula segue sem RAB (snapshot
    // vazio) e o movimento NÃO falha — apenas registramos um aviso. Resolvido
    // ANTES do upload da imagem: se o lookup falhar (ex.: timeout de DB), não
    // deixamos imagem órfã no storage.
    const rabRow = await this.rabRowRepo.findLatestByMarcas(dto.registration);
    if (!rabRow) {
      this.logger.warn(
        `Matrícula ${dto.registration} sem linha RAB correspondente — snapshot de aeronave gravado vazio.`,
      );
    }
    const snapshot = buildAircraftSnapshotCreateInput(rabRow);

    let imageKey: string | null = null;
    if (image) {
      imageKey = buildReadingImageKey(image.mimetype, dto.reading_datetime);
      await this.storage.upload(image, imageKey);
    }

    const created = await this.persist(dto, imageKey, origin, snapshot);

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
  private async persist(
    dto: MovementCreateData,
    imageKey: string | null,
    origin: MovementOrigin,
    snapshot: Parameters<typeof buildMovementCreateInput>[3],
  ) {
    try {
      return await this.repo.create(
        buildMovementCreateInput(dto, imageKey, origin, snapshot),
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
