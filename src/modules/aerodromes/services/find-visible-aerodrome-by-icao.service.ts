import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { AerodromeFileUrlsService } from '@/modules/documents/services/aerodrome-file-urls.service';

import { AerodromePublicResponseDTO } from '../dtos/aerodrome-public-response.dto';
import { AerodromeMapper } from '../mappers/aerodrome.mapper';
import { AerodromeRepository } from '../repositories/aerodrome.repository';

export type FindVisibleAerodromeByIcaoServiceInput = { icao: string };

/**
 * Ficha pública de aeródromo por ICAO. Só retorna se ativo e `isView=true`.
 * O ICAO já chega normalizado (uppercase) via `AerodromeIcaoParamDTO`.
 *
 * `imgUrl`/`kmlUrl` são resolvidos on-read a partir dos documentos ativos
 * (mesmo padrão do detalhe admin — #550), não das colunas legadas. Ver #551.
 */
@Injectable()
export class FindVisibleAerodromeByIcaoService {
  constructor(
    private readonly repo: AerodromeRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly fileUrls: AerodromeFileUrlsService,
  ) {}

  async execute(
    input: FindVisibleAerodromeByIcaoServiceInput,
  ): Promise<AerodromePublicResponseDTO> {
    const entity = await this.repo.findVisibleByIcao(input.icao);
    if (!entity) {
      throw resourceNotFound(this.errorMessageService, 'Aeródromo', input.icao);
    }
    const row = AerodromeMapper.toPublicApiRow(entity);
    const { imgUrl, kmlUrl } = await this.fileUrls.resolve(entity.id);
    row.imgUrl = imgUrl;
    row.kmlUrl = kmlUrl;
    return row;
  }
}
