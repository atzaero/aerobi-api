import type { SendMailParams } from '@/common/email/email.service';
import type {
  LandingRequest,
  LandingRequestStatus,
} from '@/generated/prisma/client';

import { maskPilotCpf } from '../utils/landing-request-pii';

/** Escapa os caracteres que quebram/injetam HTML nos valores dos e-mails. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Data em UTC (ISO 8601) ou travessão quando ausente. */
function formatUtc(date: Date | null): string {
  return date ? date.toISOString() : '—';
}

/** Linha `<li>` só quando há valor (evita campos vazios no e-mail). */
function row(label: string, value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  return `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</li>`;
}

/**
 * Bloco `<ul>` com os detalhes operacionais da solicitação. O CPF sai
 * **mascarado** (política de PII) mesmo no comprovante.
 */
function detailsBlock(request: LandingRequest, destination: string): string {
  const aircraft = [request.aircraftModel, request.aircraftRegistration]
    .filter((value): value is string => Boolean(value))
    .join(' · ');

  const rows = [
    row('Destino', destination),
    row('Origem', request.departureAerodrome),
    row('Próximo destino', request.nextDestinationAerodrome),
    row('Previsão de decolagem (UTC)', formatUtc(request.departureAt)),
    row('Previsão de pouso (UTC)', formatUtc(request.landingAt)),
    row('Previsão de saída (UTC)', formatUtc(request.exitAfterLandingAt)),
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
  ]
    .filter((line) => line.length > 0)
    .join('');

  return `<ul>${rows}</ul>`;
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
      DESTINATION: escapeHtml(destination),
      REQUESTER_NAME: escapeHtml(request.requesterName ?? 'solicitante'),
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
      DESTINATION: escapeHtml(destination),
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
    ? `<p><strong>Observação:</strong> ${escapeHtml(observation)}</p>`
    : '';

  return {
    to: request.email ?? '',
    subject: title,
    template: 'landing_request_decided',
    variables: {
      TITLE: escapeHtml(title),
      DESTINATION: escapeHtml(destination),
      DECISION_LABEL: decisionLabel,
      REQUESTER_NAME: escapeHtml(request.requesterName ?? 'solicitante'),
      DETAILS: detailsBlock(request, destination),
      OBSERVATION_BLOCK: observationBlock,
      RESPONDED_BY: escapeHtml(respondedByName),
    },
  };
}
