import { Injectable } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { resourceNotFound } from '@/common/utils/resource-not-found.util';

import { AerodromePublicResponseDTO } from '../dtos/aerodrome-public-response.dto';
import { AerodromeMapper } from '../mappers/aerodrome.mapper';
import { AerodromeRepository } from '../repositories/aerodrome.repository';

export type FindVisibleAerodromeByIcaoServiceInput = { icao: string };

/**
 * Ficha pública de aeródromo por ICAO. Só retorna se ativo e `isView=true`.
 * O ICAO já chega normalizado (uppercase) via `AerodromeIcaoParamDTO`.
 */
@Injectable()
export class FindVisibleAerodromeByIcaoService {
  constructor(
    private readonly repo: AerodromeRepository,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async execute(
    input: FindVisibleAerodromeByIcaoServiceInput,
  ): Promise<AerodromePublicResponseDTO> {
    const entity = await this.repo.findVisibleByIcao(input.icao);
    if (!entity) {
      throw resourceNotFound(this.errorMessageService, 'Aeródromo', input.icao);
    }
    return AerodromeMapper.toPublicApiRow(entity);
  }
}
