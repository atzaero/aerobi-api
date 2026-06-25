import type { CsvColumn } from '@/common/utils/csv.util';
import type { AerodromeGroup } from '@/generated/prisma/client';

/** Data ISO 8601 UTC, ou string vazia quando nula. */
function toIsoUtc(date: Date | null): string {
  return date ? date.toISOString() : '';
}

/** Booleano em pt-BR: `Sim`/`Não`; vazio quando nulo. */
function toSimNao(value: boolean | null): string {
  if (value === null) return '';
  return value ? 'Sim' : 'Não';
}

/**
 * Colunas do export CSV de grupos: **todas as 11 colunas da tabela
 * `aerodrome_groups`**, com cabeçalhos pt-BR. Funções puras (testáveis). Datas
 * em ISO 8601 UTC, booleano como Sim/Não, campos nulos como string vazia.
 * (O export traz apenas grupos ativos, então `Removido em/por` saem vazios.)
 */
export const aerodromeGroupExportColumns: CsvColumn<AerodromeGroup>[] = [
  { header: 'ID', accessor: (group) => group.id },
  { header: 'Nome', accessor: (group) => group.name },
  { header: 'UF', accessor: (group) => group.uf },
  { header: 'Proprietário', accessor: (group) => group.ownerId },
  {
    header: 'Pedido de exclusão',
    accessor: (group) => toSimNao(group.deletionRequested),
  },
  {
    header: 'Criado em (UTC)',
    accessor: (group) => group.createdAt.toISOString(),
  },
  { header: 'Criado por', accessor: (group) => group.createdBy },
  {
    header: 'Atualizado em (UTC)',
    accessor: (group) => group.updatedAt.toISOString(),
  },
  { header: 'Atualizado por', accessor: (group) => group.updatedBy },
  {
    header: 'Removido em (UTC)',
    accessor: (group) => toIsoUtc(group.deletedAt),
  },
  { header: 'Removido por', accessor: (group) => group.deletedBy },
];
