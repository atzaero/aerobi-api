import { Injectable } from '@nestjs/common';

import { AerodromeRepository } from '@/modules/aerodromes/repositories/aerodrome.repository';
import type { AerodromeDashboardSnapshotRow } from '@/modules/aerodromes/repositories/aerodrome.repository.interface';

import type { AerodromesStatsDTO } from '../../dtos/dashboard-response.dto';

/**
 * Snapshot de `aerodromes` (**sem faixa de tempo** — é estado atual) no escopo do
 * ator: total e contagens de abertos/públicos/em construção/iluminados/com
 * abastecimento. Espelha `stats-aerodromes` do `aerobi-web`.
 */
@Injectable()
export class AerodromesStatsService {
  constructor(private readonly repo: AerodromeRepository) {}

  async execute(aerodromeIds: string[] | null): Promise<AerodromesStatsDTO> {
    const rows = await this.repo.findForDashboardSnapshot(aerodromeIds);

    const count = (
      pred: (a: AerodromeDashboardSnapshotRow) => boolean,
    ): number => rows.reduce((acc, a) => acc + (pred(a) ? 1 : 0), 0);

    return {
      total: rows.length,
      open: count((a) => a.isOpen),
      view: count((a) => a.isView),
      construction: count((a) => a.construction === true),
      lit: count((a) => a.lit === true),
      fueling: count((a) => a.fueling === true),
    };
  }
}
