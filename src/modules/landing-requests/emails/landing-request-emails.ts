import {
  emailAlert,
  emailInfoTable,
} from '@/common/email/components/email-components';
import type { SendMailParams } from '@/common/email/email.service';
import { escapeHtml } from '@/common/email/utils/escape-html.util';
import { formatEmailDate } from '@/common/email/utils/format-email-date.util';
import type {
  LandingRequest,
  LandingRequestStatus,
} from '@/generated/prisma/client';

import { maskPilotCpf } from '../utils/landing-request-pii';

/** Par rótulo/valor só quando há valor (evita campos vazios no e-mail). */
function row(
  label: string,
  value: string | null | undefined,
): { label: string; value: string } | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return { label, value: escapeHtml(value) };
}

/**
 * Tabela com os detalhes operacionais da solicitação (`emailInfoTable`).
 * Injetada via placeholder raw (`DETAILS`) — os valores são escapados aqui.
 * O CPF sai **mascarado** (política de PII) mesmo no comprovante.
 */
function detailsBlock(request: LandingRequest, destination: string): string {
  const aircraft = [request.aircraftModel, request.aircraftRegistration]
    .filter((value): value is string => Boolean(value))
    .join(' · ');

  const rows = [
    row('Destino', destination),
    row('Origem', request.departureAerodrome),
    row('Próximo destino', request.nextDestinationAerodrome),
    row('Previsão de decolagem (UTC)', formatEmailDate(request.departureAt)),
    row('Previsão de pouso (UTC)', formatEmailDate(request.landingAt)),
    row('Previsão de saída (UTC)', formatEmailDate(request.exitAfterLandingAt)),
    row('Piloto', request.pilotName),
    row('CPF do piloto', maskPilotCpf(request.pilotCpf)),
    row('Código ANAC', request.pilotCode),
    row('Aeronave', aircraft || null),
    row(
      'Pessoas a bordo',
      request.peopleOnBoard === null ? null : String(request.peopleOnBoard),
    ),
    row('Solicitante', request.requesterName),
    row('Contato', request.phoneContact),
    row('E-mail', request.email),
    row('Observações', request.observation),
  ].filter(
    (entry): entry is { label: string; value: string } => entry !== null,
  );

  return emailInfoTable(rows);
}

/**
 * Comprovante ao piloto (load-bearing: se o envio falha, o create faz
 * soft-delete compensatório). `to` = e-mail do solicitante.
 */
export function buildLandingRequestReceiptEmail(
  request: LandingRequest,
  destination: string,
): SendMailParams {
  return {
    to: request.email ?? '',
    subject: `Comprovante — solicitação de pouso em ${destination}`,
    template: 'landing_request_receipt',
    variables: {
      DESTINATION: destination,
      REQUESTER_NAME: request.requesterName ?? 'solicitante',
      DETAILS: detailsBlock(request, destination),
    },
  };
}

/**
 * Notificação ao staff (coordenadores + operadores do grupo). Best-effort — a
 * falha só loga, não derruba o create.
 */
export function buildLandingRequestStaffEmail(
  request: LandingRequest,
  destination: string,
  recipients: string[],
  panelUrl: string,
): SendMailParams {
  return {
    to: recipients,
    subject: `Nova solicitação de pouso — ${destination}`,
    template: 'landing_request_staff',
    variables: {
      DESTINATION: destination,
      DETAILS: detailsBlock(request, destination),
      PANEL_URL: panelUrl,
    },
  };
}

/**
 * Notificação ao solicitante sobre a decisão (aprovada/recusada). Best-effort.
 */
export function buildLandingRequestDecidedEmail(
  request: LandingRequest,
  destination: string,
  decision: LandingRequestStatus,
  respondedByName: string,
  observation: string | null,
): SendMailParams {
  const approved = decision === 'APPROVED';
  const decisionLabel = approved ? 'APROVADA' : 'NÃO APROVADA';
  const title = approved
    ? `Solicitação de pouso aprovada — ${destination}`
    : `Solicitação de pouso não aprovada — ${destination}`;
  const observationBlock = observation
    ? emailAlert(
        'info',
        `<strong>Observação:</strong> ${escapeHtml(observation)}`,
      )
    : '';

  return {
    to: request.email ?? '',
    subject: title,
    template: 'landing_request_decided',
    variables: {
      TITLE: title,
      DESTINATION: destination,
      DECISION_LABEL: decisionLabel,
      REQUESTER_NAME: request.requesterName ?? 'solicitante',
      DETAILS: detailsBlock(request, destination),
      OBSERVATION_BLOCK: observationBlock,
      RESPONDED_BY: respondedByName,
    },
  };
}
