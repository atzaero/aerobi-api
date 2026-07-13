import { Injectable, Logger } from '@nestjs/common';

import { getErrorMessage } from '@/common/utils/error.util';
import { DocumentType } from '@/generated/prisma/client';
import { StorageService } from '@/modules/storage/services/storage.service';
import { resolveBestEffortPresignedUrl } from '@/modules/storage/utils/resolve-presigned-url';

import { DocumentRepository } from '../repositories/document.repository';

/**
 * URLs presigned dos arquivos "singleton" do aeródromo consumidos no detalhe do
 * `aerobi-web`: `imgUrl` (Designação de Cabeceira, tipo `IMAGE`) e `kmlUrl`
 * (Plano Básico, tipo `KML`). `null` quando não há documento ativo do tipo ou a
 * assinatura falha.
 */
export interface AerodromeFileUrls {
  imgUrl: string | null;
  kmlUrl: string | null;
}

/** Tipos resolvidos on-read (os dois cobertos pelo `upload-aerodrome-file`). */
const RESOLVED_TYPES = [DocumentType.IMAGE, DocumentType.KML];

/** URLs vazias — degradação best-effort quando a resolução falha. */
const EMPTY_URLS: AerodromeFileUrls = { imgUrl: null, kmlUrl: null };

/**
 * Resolve on-read as URLs de arquivo ativas do aeródromo a partir da tabela
 * `documents` (fonte da verdade), sem desnormalizar coluna: busca o documento
 * ativo mais recente de cada tipo e assina a `storageKey` best-effort. Exportado
 * pelo `DocumentsModule` e consumido pelo `FindAerodromeByIdService`.
 *
 * **Best-effort por completo**: enriquecimento acessório de campos que antes
 * eram sempre `null`; uma falha (query a `documents` indisponível ou assinatura)
 * degrada para `{ null, null }` — nunca derruba a leitura primária do aeródromo.
 */
@Injectable()
export class AerodromeFileUrlsService {
  private readonly logger = new Logger(AerodromeFileUrlsService.name);

  constructor(
    private readonly repo: DocumentRepository,
    private readonly storage: StorageService,
  ) {}

  async resolve(aerodromeId: string): Promise<AerodromeFileUrls> {
    try {
      const docs = await this.repo.findLatestActiveByAerodromeAndTypes(
        aerodromeId,
        RESOLVED_TYPES,
      );
      const keyByType = new Map(docs.map((doc) => [doc.type, doc.storageKey]));

      const [imgUrl, kmlUrl] = await Promise.all([
        resolveBestEffortPresignedUrl(
          this.storage,
          keyByType.get(DocumentType.IMAGE) ?? null,
        ),
        resolveBestEffortPresignedUrl(
          this.storage,
          keyByType.get(DocumentType.KML) ?? null,
        ),
      ]);

      return { imgUrl, kmlUrl };
    } catch (err) {
      this.logger.warn(
        `Falha ao resolver URLs de arquivo do aeródromo ${aerodromeId}: ${getErrorMessage(err)}`,
      );
      return EMPTY_URLS;
    }
  }
}
