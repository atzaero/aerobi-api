import type { Prisma, RabRow } from '@/generated/prisma/client';

/**
 * Projeta a `rab_row` mais recente da aeronave no input de criação do snapshot
 * 1:1 do movimento (nested create). Quando `rabRow` é `null` (matrícula sem RAB
 * correspondente), retorna um snapshot vazio (todos os campos `null`) para
 * preservar a invariante 1:1 — o movimento é sempre acompanhado de um snapshot.
 */
export function buildAircraftSnapshotCreateInput(
  rabRow: RabRow | null,
): Prisma.MovementAircraftSnapshotCreateWithoutMovementInput {
  if (!rabRow) {
    return {
      rabRowId: null,
      rabPeriod: null,
      marcas: null,
      proprietarios: null,
      operadores: null,
      nrSerie: null,
      dsModelo: null,
      nmFabricante: null,
      cdTipoIcao: null,
      nrPmd: null,
      nrAssentos: null,
      nrAnoFabricacao: null,
      tpMotor: null,
      qtMotor: null,
      cfOperacional: null,
      tpOperacao: null,
    };
  }

  return {
    rabRowId: rabRow.id,
    rabPeriod: rabRow.period,
    marcas: rabRow.marcas,
    proprietarios: rabRow.proprietarios,
    operadores: rabRow.operadores,
    nrSerie: rabRow.nrSerie,
    dsModelo: rabRow.dsModelo,
    nmFabricante: rabRow.nmFabricante,
    cdTipoIcao: rabRow.cdTipoIcao,
    nrPmd: rabRow.nrPmd,
    nrAssentos: rabRow.nrAssentos,
    nrAnoFabricacao: rabRow.nrAnoFabricacao,
    tpMotor: rabRow.tpMotor,
    qtMotor: rabRow.qtMotor,
    cfOperacional: rabRow.cfOperacional,
    tpOperacao: rabRow.tpOperacao,
  };
}
