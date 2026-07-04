import {
  LandingRequestStatus,
  type LandingRequest,
  type LandingRequestAircraft,
  type UserRole,
} from '@/generated/prisma/client';

import { LandingRequestAircraftResponseDTO } from '../dtos/landing-request-aircraft-response.dto';
import { LandingRequestResponseDTO } from '../dtos/landing-request-response.dto';
import { maskPilotCpf } from '../utils/landing-request-pii';

/** Ator revisor resolvido do `users` (subconjunto para o response). */
export interface LandingRequestReviewer {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

/**
 * Deriva `answer` (tri-estado) do `status` — sem persistir coluna redundante
 * (decisão 8 da #377): APPROVED→`true`, REJECTED→`false`, PENDING→`null`.
 */
function deriveAnswer(status: LandingRequestStatus): boolean | null {
  if (status === LandingRequestStatus.APPROVED) return true;
  if (status === LandingRequestStatus.REJECTED) return false;
  return null;
}

function toAircraftRow(
  aircraft: LandingRequestAircraft,
): LandingRequestAircraftResponseDTO {
  const row = new LandingRequestAircraftResponseDTO();
  row.period = aircraft.period;
  row.marcas = aircraft.marcas;
  row.proprietarios = aircraft.proprietarios;
  row.operadores = aircraft.operadores;
  row.nrCertMatricula = aircraft.nrCertMatricula;
  row.nrSerie = aircraft.nrSerie;
  row.cdTipo = aircraft.cdTipo;
  row.dsModelo = aircraft.dsModelo;
  row.nmFabricante = aircraft.nmFabricante;
  row.cdCls = aircraft.cdCls;
  row.nrPmd = aircraft.nrPmd;
  row.cdTipoIcao = aircraft.cdTipoIcao;
  row.nrTripulacaoMin = aircraft.nrTripulacaoMin;
  row.nrPassageirosMax = aircraft.nrPassageirosMax;
  row.nrAssentos = aircraft.nrAssentos;
  row.nrAnoFabricacao = aircraft.nrAnoFabricacao;
  row.dtValidadeCva = aircraft.dtValidadeCva;
  row.dtValidadeCa = aircraft.dtValidadeCa;
  row.dtCanc = aircraft.dtCanc;
  row.dsMotivoCanc = aircraft.dsMotivoCanc;
  row.cdInterdicao = aircraft.cdInterdicao;
  row.dsGravame = aircraft.dsGravame;
  row.dtMatricula = aircraft.dtMatricula;
  row.tpMotor = aircraft.tpMotor;
  row.qtMotor = aircraft.qtMotor;
  row.tpPouso = aircraft.tpPouso;
  row.tpCa = aircraft.tpCa;
  row.cdPropositoCave = aircraft.cdPropositoCave;
  row.cfOperacional = aircraft.cfOperacional;
  row.dsCategoriaHomologacao = aircraft.dsCategoriaHomologacao;
  row.tpOperacao = aircraft.tpOperacao;
  return row;
}

/**
 * Projeta a entidade no response da moderação, aplicando os invariantes de
 * segurança: CPF **mascarado**, `answer` derivado, `reviewer` resolvido de
 * `reviewedBy` e **sem** expor `deletedAt`/`deletedBy`. `rabAircraft` só é
 * preenchido quando fornecido (`GET /:id`).
 */
export class LandingRequestMapper {
  static toApiRow(
    entity: LandingRequest,
    opts: {
      reviewer?: LandingRequestReviewer | null;
      aircraft?: LandingRequestAircraft | null;
    } = {},
  ): LandingRequestResponseDTO {
    const row = new LandingRequestResponseDTO();
    row.id = entity.id;
    row.aerodromeId = entity.aerodromeId;
    row.status = entity.status;
    row.answer = deriveAnswer(entity.status);
    row.requestDate = entity.requestDate.toISOString();
    row.uf = entity.uf;
    row.icao = entity.icao;
    row.departureAerodrome = entity.departureAerodrome;
    row.nextDestinationAerodrome = entity.nextDestinationAerodrome;
    row.email = entity.email;
    row.requesterName = entity.requesterName;
    row.phoneContact = entity.phoneContact;
    row.pilotName = entity.pilotName;
    row.pilotCpf = maskPilotCpf(entity.pilotCpf);
    row.pilotCode = entity.pilotCode;
    row.aircraftModel = entity.aircraftModel;
    row.aircraftRegistration = entity.aircraftRegistration;
    row.foreignRegistration = entity.foreignRegistration;
    row.peopleOnBoard = entity.peopleOnBoard;
    row.acceptedTerms = entity.acceptedTerms;
    row.confirmedTrue = entity.confirmedTrue;
    row.departureAt = entity.departureAt
      ? entity.departureAt.toISOString()
      : null;
    row.landingAt = entity.landingAt ? entity.landingAt.toISOString() : null;
    row.exitAfterLandingAt = entity.exitAfterLandingAt
      ? entity.exitAfterLandingAt.toISOString()
      : null;
    row.observation = entity.observation;
    row.reviewedAt = entity.reviewedAt ? entity.reviewedAt.toISOString() : null;
    row.reviewedBy = entity.reviewedBy;
    row.reviewer = opts.reviewer ?? null;
    row.createdAt = entity.createdAt.toISOString();
    row.createdBy = entity.createdBy;
    row.updatedAt = entity.updatedAt.toISOString();
    row.updatedBy = entity.updatedBy;
    if (opts.aircraft !== undefined) {
      row.rabAircraft = opts.aircraft ? toAircraftRow(opts.aircraft) : null;
    }
    return row;
  }

  static toApiRows(
    entities: LandingRequest[],
    reviewersById: Map<string, LandingRequestReviewer> = new Map(),
  ): LandingRequestResponseDTO[] {
    return entities.map((entity) =>
      LandingRequestMapper.toApiRow(entity, {
        reviewer: entity.reviewedBy
          ? (reviewersById.get(entity.reviewedBy) ?? null)
          : null,
      }),
    );
  }
}
