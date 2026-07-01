import type { CsvColumn } from '@/common/utils/csv.util';

import type { AerodromeWithGroup } from '../repositories/aerodrome.repository.interface';

/**
 * Booleano em pt-BR espelhando `yesNo` do `aerobi-web` (`export/columns.ts`):
 * `v ? 'Sim' : 'Não'` — ausente/`null` conta como `Não` (os toggles do web
 * chegam sempre como boolean após o mapper).
 */
function yesNo(value: boolean | null): string {
  return value ? 'Sim' : 'Não';
}

/**
 * Colunas do export CSV de aeródromos — as **11 colunas do web** (`export/
 * columns.ts`), na mesma ordem e com os mesmos rótulos pt-BR. É o subconjunto de
 * listagem (não inclui coordenadas/observação/telefone). A UF vem de `group.uf`
 * (derivada); a coluna "Grupo" traz o `groupId` cru (igual ao web).
 */
export const aerodromeExportColumns: CsvColumn<AerodromeWithGroup>[] = [
  { header: 'ICAO', accessor: (a) => a.icao },
  { header: 'Nome', accessor: (a) => a.name },
  { header: 'Município', accessor: (a) => a.municipality ?? '' },
  { header: 'UF', accessor: (a) => a.group?.uf ?? '' },
  { header: 'Grupo', accessor: (a) => a.groupId },
  { header: 'Aberto', accessor: (a) => yesNo(a.isOpen) },
  { header: 'Visível', accessor: (a) => yesNo(a.isView) },
  { header: 'Meteorologia', accessor: (a) => yesNo(a.weatherStationDisplay) },
  { header: 'Balizado', accessor: (a) => yesNo(a.lit) },
  { header: 'Abastecimento', accessor: (a) => yesNo(a.fueling) },
  { header: 'Criado em (UTC)', accessor: (a) => a.createdAt.toISOString() },
];
