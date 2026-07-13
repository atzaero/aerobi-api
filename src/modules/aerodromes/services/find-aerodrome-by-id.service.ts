import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';
import { AerodromeFileUrlsService } from '@/modules/documents/services/aerodrome-file-urls.service';

import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { AerodromeMapper } from '../mappers/aerodrome.mapper';
import { AerodromeRepository } from '../repositories/aerodrome.repository';

export type FindAerodromeByIdServiceInput = { id: string };

@Injectable()
export class FindAerodromeByIdService {
  constructor(
    private readonly repo: AerodromeRepository,
    private readonly errorMessageService: ErrorMessageService,
    private readonly fileUrls: AerodromeFileUrlsService,
  ) {}

  async execute(
    input: FindAerodromeByIdServiceInput,
  ): Promise<AerodromeResponseDTO> {
    /** Escopo por grupo já validado pelo `GroupScopeGuard`; aqui só a existência. */
    const entity = await this.repo.findById(input.id);
    if (!entity) {
      throw resourceNotFound(this.errorMessageService, 'Aeródromo', input.id);
    }
    const row = AerodromeMapper.toApiRow(entity);
    /**
     * `imgUrl`/`kmlUrl` são resolvidos on-read a partir dos documentos ativos
     * (fonte da verdade), não das colunas legadas — só no detalhe (o `list`/
     * `export` não os consomem no web). Ver #550.
     */
    const { imgUrl, kmlUrl } = await this.fileUrls.resolve(entity.id);
    row.imgUrl = imgUrl;
    row.kmlUrl = kmlUrl;
    return row;
  }
}
