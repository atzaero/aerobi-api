import {
  LandingRequestStatus,
  type Prisma,
  type RabRow,
  type Uf,
} from '@/generated/prisma/client';

import type { LandingRequestAircraftCreateData } from '../repositories/landing-request.repository.interface';

/**
 * Dados já resolvidos/normalizados pelo service para gravar uma solicitação de
 * pouso (o create público não aceita `status`/`reviewedBy` do cliente — são
 * definidos no servidor: `status = PENDING`, `createdBy = 'public'`).
 */
export interface LandingRequestCreateData {
  aerodromeId: string;
  requestDate: Date;
  email: string;
  pilotCode: string;
  aircraftModel: string;
  aircraftRegistration: string;
  departureAerodrome: string;
  nextDestinationAerodrome: string;
  observation: string | null;
  pilotName: string;
  pilotCpf: string;
  phoneContact: string;
  requesterName: string;
  peopleOnBoard: number;
  acceptedTerms: boolean;
  confirmedTrue: boolean;
  foreignRegistration: boolean;
  icao: string;
  uf: Uf;
  departureAt: Date;
  landingAt: Date;
  exitAfterLandingAt: Date;
  createdBy: string;
}

/** Monta o input Prisma de criação da solicitação (status inicial `PENDING`). */
export function buildLandingRequestCreateInput(
  data: LandingRequestCreateData,
): Prisma.LandingRequestCreateInput {
  return {
    aerodrome: { connect: { id: data.aerodromeId } },
    status: LandingRequestStatus.PENDING,
    requestDate: data.requestDate,
    email: data.email,
    pilotCode: data.pilotCode,
    aircraftModel: data.aircraftModel,
    aircraftRegistration: data.aircraftRegistration,
    departureAerodrome: data.departureAerodrome,
    nextDestinationAerodrome: data.nextDestinationAerodrome,
    observation: data.observation,
    pilotName: data.pilotName,
    pilotCpf: data.pilotCpf,
    phoneContact: data.phoneContact,
    requesterName: data.requesterName,
    peopleOnBoard: data.peopleOnBoard,
    acceptedTerms: data.acceptedTerms,
    confirmedTrue: data.confirmedTrue,
    foreignRegistration: data.foreignRegistration,
    icao: data.icao,
    uf: data.uf,
    departureAt: data.departureAt,
    landingAt: data.landingAt,
    exitAfterLandingAt: data.exitAfterLandingAt,
    createdBy: data.createdBy,
  };
}

/**
 * Projeta um `RabRow` no snapshot da aeronave (mesmos campos, sem `id`/relação).
 * Gravado só quando a matrícula nacional foi encontrada de forma exata no RAB.
 */
export function buildAircraftCreateData(
  row: RabRow,
): LandingRequestAircraftCreateData {
  return {
    period: row.period,
    marcas: row.marcas,
    proprietarios: row.proprietarios,
    operadores: row.operadores,
    nrCertMatricula: row.nrCertMatricula,
    nrSerie: row.nrSerie,
    cdTipo: row.cdTipo,
    dsModelo: row.dsModelo,
    nmFabricante: row.nmFabricante,
    cdCls: row.cdCls,
    nrPmd: row.nrPmd,
    cdTipoIcao: row.cdTipoIcao,
    nrTripulacaoMin: row.nrTripulacaoMin,
    nrPassageirosMax: row.nrPassageirosMax,
    nrAssentos: row.nrAssentos,
    nrAnoFabricacao: row.nrAnoFabricacao,
    dtValidadeCva: row.dtValidadeCva,
    dtValidadeCa: row.dtValidadeCa,
    dtCanc: row.dtCanc,
    dsMotivoCanc: row.dsMotivoCanc,
    cdInterdicao: row.cdInterdicao,
    dsGravame: row.dsGravame,
    dtMatricula: row.dtMatricula,
    tpMotor: row.tpMotor,
    qtMotor: row.qtMotor,
    tpPouso: row.tpPouso,
    tpCa: row.tpCa,
    cdPropositoCave: row.cdPropositoCave,
    cfOperacional: row.cfOperacional,
    dsCategoriaHomologacao: row.dsCategoriaHomologacao,
    tpOperacao: row.tpOperacao,
  };
}

/**
 * Monta o input Prisma de uma decisão: grava `status`, `reviewedAt`,
 * `reviewedBy = actor.id` e `updatedBy`; `observation` **só** é sobrescrita
 * quando enviada (preserva a do solicitante).
 */
export function buildDecideUpdateInput(params: {
  decision: LandingRequestStatus;
  observation?: string;
  reviewedBy: string;
  reviewedAt: Date;
}): Prisma.LandingRequestUpdateInput {
  const data: Prisma.LandingRequestUpdateInput = {
    status: params.decision,
    reviewedAt: params.reviewedAt,
    reviewedBy: params.reviewedBy,
    updatedBy: params.reviewedBy,
  };
  if (params.observation !== undefined) {
    data.observation = params.observation;
  }
  return data;
}
