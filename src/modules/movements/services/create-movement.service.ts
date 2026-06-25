import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { getErrorMessage } from '@/common/utils/error.util';
import { RabRowRepository } from '@/modules/rab/repositories/rab-row.repository';
import { normalizeMarcas } from '@/modules/rab/utils/normalize-marcas';
import { StorageService } from '@/modules/storage/services/storage.service';

import { CreateMovementResponseDTO } from '../dtos/create-movement-response.dto';
import {
  MOVEMENT_CREATED_EVENT,
  type MovementCreatedEvent,
} from '../events/movement-created.event';
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

/**
 * Opções de execução do {@link CreateMovementService.execute}. Usadas pelo
 * caminho de lote (batch): `batched` marca o evento emitido (notificação avulsa
 * ignora; conformidade processa na mesma) e `onCreated` deixa o caller coletar o
 * payload já resolvido sem expor esses campos no DTO de resposta.
 */
export interface CreateMovementOptions {
  batched?: boolean;
  onCreated?: (event: MovementCreatedEvent) => void;
}

@Injectable()
export class CreateMovementService {
  private readonly logger = new Logger(CreateMovementService.name);

  constructor(
    private readonly repo: MovementRepository,
    private readonly storage: StorageService,
    private readonly errorMessageService: ErrorMessageService,
    private readonly rabRowRepo: RabRowRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    dto: MovementCreateData,
    origin: MovementOrigin,
    image?: Express.Multer.File,
    options?: CreateMovementOptions,
  ): Promise<CreateMovementResponseDTO> {
    // Valida o mimetype antes de qualquer efeito colateral (fail-fast).
    if (image) {
      this.assertImageMimetype(image.mimetype);
    }

    /**
     * Normaliza a matrícula para a forma canônica (sem hífen/espaços,
     * maiúsculas) uma única vez na fronteira do service. Tudo a jusante —
     * lookup no RAB, toggle de 48h, persistência e evento — opera sobre o mesmo
     * `dto` canônico, casando com `rab_row.marcas` e garantindo consistência
     * entre movimentos. A exibição com hífen fica na camada de apresentação.
     * Idempotente: entrada já canônica (`PRZTT`) não é alterada — o
     * `BatchCreateMovementService` pode delegar sem pré-normalizar.
     */
    const canonicalDto: MovementCreateData = {
      ...dto,
      registration: normalizeMarcas(dto.registration),
    };

    // Congela um snapshot dos dados RAB da aeronave no instante do movimento.
    // A `rab_row` é periódica; sem match a matrícula segue sem RAB (snapshot
    // vazio) e o movimento NÃO falha — apenas registramos um aviso. Resolvido
    // ANTES do upload da imagem: se o lookup falhar (ex.: timeout de DB), não
    // deixamos imagem órfã no storage.
    const rabRow = await this.rabRowRepo.findLatestByMarcas(
      canonicalDto.registration,
    );
    if (!rabRow) {
      this.logger.warn(
        `Matrícula ${canonicalDto.registration} sem linha RAB correspondente — snapshot de aeronave gravado vazio.`,
      );
    }
    const snapshot = buildAircraftSnapshotCreateInput(rabRow);

    // Resolve o tipo de operação (pouso/decolagem) antes do upload, junto do
    // snapshot RAB e pela mesma razão: se a consulta de inferência falhar, não
    // deixamos imagem órfã no storage. No caminho AUTOMATIC (sem operationType
    // na origem) aplica a regra toggle de 48h; no MANUAL a origem já traz o
    // valor do formulário e é preservada como está.
    const resolvedOrigin = await this.resolveOperationType(
      canonicalDto,
      origin,
    );

    let imageKey: string | null = null;
    if (image) {
      imageKey = buildReadingImageKey(
        image.mimetype,
        canonicalDto.reading_datetime,
      );
      await this.storage.upload(image, imageKey);
    }

    const created = await this.persist(
      canonicalDto,
      imageKey,
      resolvedOrigin,
      snapshot,
    );

    // Side-effects desacoplados (snapshot/conformidade, notificações) reagem via
    // listeners (#252/#253). Best-effort e síncrono: a emissão NÃO altera o
    // retorno nem o erro do `execute` e não pode quebrar a ingestão.
    const createdEvent: MovementCreatedEvent = {
      movementId: created.id,
      registration: canonicalDto.registration,
      aerodrome: canonicalDto.aerodrome ?? null,
      operationType: resolvedOrigin.operationType ?? origin.operationType!,
      source: origin.source,
      readingDatetime: canonicalDto.reading_datetime,
      batched: options?.batched ?? false,
    };
    this.eventEmitter.emit(MOVEMENT_CREATED_EVENT, createdEvent);

    /**
     * Hook opcional para o caller coletar o payload já resolvido (usado pelo
     * batch para montar o resumo agregado). Não substitui o evento acima — a
     * conformidade continua reagindo por item; o hook só evita expor os campos
     * resolvidos no DTO de resposta da rota.
     */
    options?.onCreated?.(createdEvent);

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
          const msg = getErrorMessage(delErr);
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
