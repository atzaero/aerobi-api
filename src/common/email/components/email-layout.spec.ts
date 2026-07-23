import { EMAIL_COLORS, EMAIL_LOGO_CID } from './email-colors';
import { renderEmailLayout } from './email-layout';

describe('renderEmailLayout', () => {
  it('gera documento HTML completo com heading e conteúdo', () => {
    const html = renderEmailLayout({
      heading: 'Título do email',
      contentHtml: '<p>corpo</p>',
    });
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<html lang="pt-BR">');
    expect(html).toContain('<title>Título do email</title>');
    expect(html).toContain('<p>corpo</p>');
  });

  it('inclui a logo via CID e a barra da marca', () => {
    const html = renderEmailLayout({ heading: 'T', contentHtml: '' });
    expect(html).toContain(`src="cid:${EMAIL_LOGO_CID}"`);
    expect(html).toContain(`background:${EMAIL_COLORS.brand}`);
  });

  it('renderiza eyebrow e footerNote apenas quando fornecidos', () => {
    const sem = renderEmailLayout({ heading: 'T', contentHtml: '' });
    expect(sem).not.toContain('text-transform:uppercase');

    const com = renderEmailLayout({
      heading: 'T',
      contentHtml: '',
      eyebrow: 'Segurança',
      footerNote: 'Se não foi você, ignore.',
    });
    expect(com).toContain('Segurança');
    expect(com).toContain('text-transform:uppercase');
    expect(com).toContain('Se não foi você, ignore.');
  });

  it('inclui rodapé institucional com o ano corrente', () => {
    const html = renderEmailLayout({ heading: 'T', contentHtml: '' });
    expect(html).toContain(
      `© ${new Date().getFullYear()} Aerobi · Este é um e-mail automático, não responda.`,
    );
  });

  it('mantém as classes responsivas do media query', () => {
    const html = renderEmailLayout({ heading: 'T', contentHtml: '' });
    for (const cls of ['ae-card', 'ae-pad', 'ae-logo', 'ae-h1']) {
      expect(html).toContain(`class="${cls}"`);
      expect(html).toContain(`.${cls}`);
    }
  });
});
