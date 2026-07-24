import { emailInfoTable } from '../components/email-components';
import { renderEmailLayout } from '../components/email-layout';
import { htmlToText } from './html-to-text.util';

describe('htmlToText', () => {
  it('remove tags e converte fechamentos de bloco em quebras de linha', () => {
    const text = htmlToText('<p>primeira</p><p>segunda</p>');
    expect(text).toBe('primeira\nsegunda');
  });

  it('converte <br> em quebra de linha', () => {
    expect(htmlToText('<p>a<br />b</p>')).toBe('a\nb');
  });

  it('decodifica as entidades de escapeHtml na ordem correta', () => {
    expect(
      htmlToText('<p>&amp;lt; &lt;b&gt; &quot;x&quot; &#39;y&#39;</p>'),
    ).toBe('&lt; <b> "x" \'y\'');
  });

  it('mantém rótulo e valor da info table na mesma linha', () => {
    const text = htmlToText(
      emailInfoTable([
        { label: 'Destino', value: 'SBBI' },
        { label: 'Piloto', value: 'Ana' },
      ]),
    );
    expect(text).toContain('Destino SBBI');
    expect(text).toContain('Piloto Ana');
  });

  it('descarta head (title/style) e colapsa linhas em branco no layout completo', () => {
    const text = htmlToText(
      renderEmailLayout({
        eyebrow: 'Segurança',
        heading: 'Título do email',
        contentHtml: '<p>corpo do email</p>',
        footerNote: 'nota final',
      }),
    );
    expect(text).not.toContain('@media');
    expect(text).not.toContain('ae-card');
    /** O heading aparece 1x (o <title> do head é descartado). */
    expect(text.match(/Título do email/g)).toHaveLength(1);
    expect(text).toContain('corpo do email');
    expect(text).toContain('nota final');
    expect(text).toContain('e-mail automático');
    expect(text).not.toMatch(/\n{3,}/);
    expect(text).not.toContain('<');
  });
});
