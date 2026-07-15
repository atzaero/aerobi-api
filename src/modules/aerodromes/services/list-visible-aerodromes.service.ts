import { Injectable } from '@nestjs/common';

import { AerodromePublicResponseDTO } from '../dtos/aerodrome-public-response.dto';
import { AerodromeMapper } from '../mappers/aerodrome.mapper';
import { AerodromeRepository } from '../repositories/aerodrome.repository';

/**
 * Lista todos os aeródromos ativos com `isView=true` para o mapa público.
 * Sem paginação — o cliente precisa de todos os marcadores de uma vez.
 */
@Injectable()
export class ListVisibleAerodromesService {
  constructor(private readonly repo: AerodromeRepository) {}

  async execute(): Promise<AerodromePublicResponseDTO[]> {
    const items = await this.repo.findAllVisible();
    return AerodromeMapper.toPublicApiRows(items);
  }
}
