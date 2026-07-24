import { escapeHtml } from './escape-html.util';

describe('escapeHtml', () => {
  it('escapa as cinco entidades HTML', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
  });

  it('escapa & primeiro (sem duplo-escape das demais entidades)', () => {
    expect(escapeHtml('<b>')).toBe('&lt;b&gt;');
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });

  it('mantém texto sem caracteres especiais intacto', () => {
    expect(escapeHtml('Aeródromo SBBI — pista 06/24')).toBe(
      'Aeródromo SBBI — pista 06/24',
    );
  });
});
