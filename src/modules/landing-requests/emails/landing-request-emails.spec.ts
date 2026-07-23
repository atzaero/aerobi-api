import type { LandingRequest } from '@/generated/prisma/client';

import {
  buildLandingRequestDecidedEmail,
  buildLandingRequestReceiptEmail,
  buildLandingRequestStaffEmail,
} from './landing-request-emails';

/** Fixture mínima — só os campos lidos pelos builders são relevantes. */
function makeRequest(overrides: Partial<LandingRequest> = {}): LandingRequest {
  return {
    departureAerodrome: 'SBCT',
    nextDestinationAerodrome: 'SBFL',
    departureAt: new Date('2026-07-20T10:00:00Z'),
    landingAt: new Date('2026-07-20T12:30:00Z'),
    exitAfterLandingAt: null,
    pilotName: 'Ana Souza',
    pilotCpf: '12345678901',
    pilotCode: 'ANAC-42',
    aircraftModel: 'Cessna 172',
    aircraftRegistration: 'PR-ABC',
    peopleOnBoard: 3,
    requesterName: 'Carlos & Cia',
    phoneContact: '+55 41 99999-0000',
    email: 'carlos@example.com',
    observation: null,
    ...overrides,
  } as LandingRequest;
}

describe('landing-request email builders', () => {
  describe('buildLandingRequestReceiptEmail', () => {
    it('monta comprovante com destino no subject e DETAILS em tabela', () => {
      const params = buildLandingRequestReceiptEmail(makeRequest(), 'SBBI');

      expect(params.template).toBe('landing_request_receipt');
      expect(params.to).toBe('carlos@example.com');
      expect(params.subject).toBe('Comprovante — solicitação de pouso em SBBI');
      expect(params.variables?.DESTINATION).toBe('SBBI');
      expect(params.variables?.DETAILS).toContain('<table');
      expect(params.variables?.DETAILS).toContain('Destino');
      expect(params.variables?.DETAILS).toContain('SBCT');
    });

    it('mascara o CPF do piloto e não expõe o CPF em claro', () => {
      const params = buildLandingRequestReceiptEmail(makeRequest(), 'SBBI');

      expect(params.variables?.DETAILS).toContain('123.456.***-**');
      expect(params.variables?.DETAILS).not.toContain('12345678901');
    });

    it('escapa valores dinâmicos dentro de DETAILS (rawKey)', () => {
      const params = buildLandingRequestReceiptEmail(
        makeRequest({ pilotName: '<script>alert(1)</script>' }),
        'SBBI',
      );

      expect(params.variables?.DETAILS).toContain('&lt;script&gt;');
      expect(params.variables?.DETAILS).not.toContain('<script>');
    });

    it('omite linhas sem valor (ex.: observações e saída após pouso)', () => {
      const params = buildLandingRequestReceiptEmail(makeRequest(), 'SBBI');

      expect(params.variables?.DETAILS).not.toContain('Observações');
      expect(params.variables?.DETAILS).toContain('Previsão de saída (UTC)');
      expect(params.variables?.DETAILS).toContain('—');
    });

    it('não escapa escalares no builder (o service escapa por padrão)', () => {
      const params = buildLandingRequestReceiptEmail(makeRequest(), 'SBBI');

      expect(params.variables?.REQUESTER_NAME).toBe('Carlos & Cia');
    });
  });

  describe('buildLandingRequestStaffEmail', () => {
    it('envia para a lista de staff com link do painel', () => {
      const params = buildLandingRequestStaffEmail(
        makeRequest(),
        'SBBI',
        ['coord@aerobi.com.br', 'op@aerobi.com.br'],
        'https://painel.example/solicitacoes',
      );

      expect(params.template).toBe('landing_request_staff');
      expect(params.to).toEqual(['coord@aerobi.com.br', 'op@aerobi.com.br']);
      expect(params.variables?.PANEL_URL).toBe(
        'https://painel.example/solicitacoes',
      );
      expect(params.variables?.DETAILS).toContain('<table');
    });
  });

  describe('buildLandingRequestDecidedEmail', () => {
    it('monta decisão aprovada com labels corretos', () => {
      const params = buildLandingRequestDecidedEmail(
        makeRequest(),
        'SBBI',
        'APPROVED',
        'Coordenadora Lia',
        null,
      );

      expect(params.template).toBe('landing_request_decided');
      expect(params.subject).toBe('Solicitação de pouso aprovada — SBBI');
      expect(params.variables?.TITLE).toBe(
        'Solicitação de pouso aprovada — SBBI',
      );
      expect(params.variables?.DECISION_LABEL).toBe('APROVADA');
      expect(params.variables?.RESPONDED_BY).toBe('Coordenadora Lia');
      expect(params.variables?.OBSERVATION_BLOCK).toBe('');
    });

    it('monta decisão recusada com observação em alerta escapado', () => {
      const params = buildLandingRequestDecidedEmail(
        makeRequest(),
        'SBBI',
        'REJECTED',
        'Coordenadora Lia',
        'Pista <fechada> para obras',
      );

      expect(params.subject).toBe('Solicitação de pouso não aprovada — SBBI');
      expect(params.variables?.DECISION_LABEL).toBe('NÃO APROVADA');
      expect(params.variables?.OBSERVATION_BLOCK).toContain('Observação');
      expect(params.variables?.OBSERVATION_BLOCK).toContain('&lt;fechada&gt;');
      expect(params.variables?.OBSERVATION_BLOCK).not.toContain('<fechada>');
    });
  });
});
