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
import { MovementType } from '@/generated/prisma/enums';

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

    // Resolve o tipo de operação (pouso/decolagem) antes do upload, junto do
    // snapshot RAB e pela mesma razão: se a consulta de inferência falhar, não
    // deixamos imagem órfã no storage. No caminho AUTOMATIC (sem operationType
    // na origem) aplica a regra toggle de 48h; no MANUAL a origem já traz o
    // valor do formulário e é preservada como está.
    const resolvedOrigin = await this.resolveOperationType(dto, origin);

    let imageKey: string | null = null;
    if (image) {
      imageKey = buildReadingImageKey(image.mimetype, dto.reading_datetime);
      await this.storage.upload(image, imageKey);
    }

    const created = await this.persist(dto, imageKey, resolvedOrigin, snapshot);

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

  /**
   * Garante o `operationType` da origem antes de persistir.
   *
   * - MANUAL: a origem já traz o `operationType` do formulário — retorna como
   *   está, sem consultar a regra.
   * - AUTOMATIC (origem sem `operationType`): infere via regra **toggle de 48h**.
   *
   * ### Regra toggle (heurística de 48h)
   * Para a matrícula no aeródromo, olha-se o ÚLTIMO movimento ativo nas últimas
   * 48h anteriores à leitura:
   *
   * | Último movimento em 48h | operationType inferido |
   * |-------------------------|------------------------|
   * | nenhum                  | LANDING                |
   * | LANDING                 | TAKEOFF                |
   * | TAKEOFF                 | LANDING                |
   *
   * Racional: a aeronave alterna pouso↔decolagem. Inferir só por "existe algum
   * movimento em 48h → decolagem" geraria duas decolagens seguidas sem pouso
   * intermediário; o toggle pelo ÚLTIMO estado reflete o ciclo operacional real.
   * A janela de 48h evita encadear com operações antigas. O primeiro avistamento
   * (sem histórico em 48h) é LANDING — a aeronave chegou. Decisão registrada na
   * epic #229.
   *
   * Best-effort em lote: itens do mesmo batch podem correr concorrentemente e não
   * são serializados; a inferência usa o estado visível no momento da consulta.
   */
  private async resolveOperationType(
    dto: MovementCreateData,
    origin: MovementOrigin,
  ): Promise<MovementOrigin> {
    // MANUAL: operationType já definido pelo formulário — não aplica a regra.
    if (origin.operationType !== undefined) {
      return origin;
    }

    const last = await this.repo.findLastByRegistrationWithin48h(
      dto.registration,
      dto.aerodrome ?? null,
      dto.reading_datetime,
    );

    const operationType =
      last?.operationType === MovementType.LANDING
        ? MovementType.TAKEOFF
        : MovementType.LANDING;

    return { ...origin, operationType };
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
