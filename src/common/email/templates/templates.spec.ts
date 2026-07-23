import { EmailTemplate, templates } from './index';

/**
 * Placeholders esperados por template — espelha as chaves declaradas em
 * `TemplateVariables` (não introspectável em runtime). Se um template ganhar
 * ou perder um `[KEY]`, este teste aponta a divergência.
 */
const EXPECTED_PLACEHOLDERS: Record<EmailTemplate, string[]> = {
  generic_notification: ['TITLE', 'NAME', 'MESSAGE'],
  invite: ['NAME', 'INVITED_BY', 'ROLE_LABEL', 'EXPIRES_AT', 'ACCEPT_URL'],
  password_reset: ['NAME', 'EXPIRES_AT', 'RESET_URL', 'IP_ADDRESS'],
  email_changed: ['NAME', 'OLD_EMAIL', 'NEW_EMAIL'],
  landing_non_conformity: ['REGISTRATION', 'AERODROME', 'OCCURRED_AT'],
  contact_receipt: ['NAME', 'EMAIL', 'PHONE', 'TYPE_LABEL', 'MESSAGE'],
  landing_request_receipt: ['DESTINATION', 'REQUESTER_NAME', 'DETAILS'],
  landing_request_staff: ['DESTINATION', 'DETAILS', 'PANEL_URL'],
  landing_request_decided: [
    'TITLE',
    'REQUESTER_NAME',
    'DESTINATION',
    'DECISION_LABEL',
    'DETAILS',
    'OBSERVATION_BLOCK',
    'RESPONDED_BY',
  ],
  maintenance_invitation: ['AERODROME_LABEL', 'LINK', 'SECURITY_CODE'],
};

/** Mesmo regex usado por `EmailService.renderTemplate`. */
const PLACEHOLDER_REGEX = /\[([A-Z0-9_]+)\]/g;

function extractPlaceholders(html: string): Set<string> {
  return new Set(
    Array.from(html.matchAll(PLACEHOLDER_REGEX), (match) => match[1]),
  );
}

describe('email templates registry', () => {
  const keys = Object.keys(templates) as EmailTemplate[];

  it.each(keys)('%s declara exatamente os placeholders esperados', (key) => {
    const found = extractPlaceholders(templates[key].html);
    expect(found).toEqual(new Set(EXPECTED_PLACEHOLDERS[key]));
  });

  it.each(keys)('%s é um documento HTML completo com o layout base', (key) => {
    const { html } = templates[key];
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<html lang="pt-BR">');
    expect(html).toContain('cid:aerobi-logo');
    expect(html).toContain('não responda');
  });

  it.each(keys)('%s só lista rawKeys que existem como placeholder', (key) => {
    const found = extractPlaceholders(templates[key].html);
    for (const rawKey of templates[key].rawKeys ?? []) {
      expect(found).toContain(rawKey);
    }
  });
});
