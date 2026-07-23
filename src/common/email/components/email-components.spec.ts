import { ALERT_TONES, EMAIL_COLORS } from './email-colors';
import {
  emailAlert,
  emailButton,
  emailCode,
  emailInfoTable,
  emailParagraph,
} from './email-components';

describe('email components', () => {
  describe('emailParagraph', () => {
    it('envolve o conteúdo num <p> com a cor de texto padrão', () => {
      const html = emailParagraph('Olá mundo');
      expect(html).toContain('<p style=');
      expect(html).toContain('Olá mundo');
      expect(html).toContain(EMAIL_COLORS.text);
    });
  });

  describe('emailButton', () => {
    it('gera âncora com href, label e fundo na cor da marca', () => {
      const html = emailButton('Aceitar convite', 'https://app.example/x');
      expect(html).toContain('href="https://app.example/x"');
      expect(html).toContain('Aceitar convite');
      expect(html).toContain(`background:${EMAIL_COLORS.brand}`);
    });
  });

  describe('emailInfoTable', () => {
    it('renderiza uma linha por par label/valor com bordas', () => {
      const html = emailInfoTable([
        { label: 'Nome', value: 'Maria' },
        { label: 'Email', value: 'maria@example.com' },
      ]);
      expect(html).toContain('Nome');
      expect(html).toContain('Maria');
      expect(html).toContain('maria@example.com');
      expect(html.match(/<tr>/g)).toHaveLength(2);
      expect(html).toContain(`border:1px solid ${EMAIL_COLORS.border}`);
    });

    it('aceita HTML no valor (ex.: emailCode)', () => {
      const html = emailInfoTable([
        { label: 'Código', value: emailCode('ABC123') },
      ]);
      expect(html).toContain("font-family:'Courier New',monospace");
      expect(html).toContain('ABC123');
    });
  });

  describe('emailAlert', () => {
    it.each(['success', 'warning', 'danger', 'info'] as const)(
      'aplica bg/borda/texto do tom %s',
      (tone) => {
        const html = emailAlert(tone, 'mensagem');
        expect(html).toContain(`background:${ALERT_TONES[tone].bg}`);
        expect(html).toContain(
          `border-left:4px solid ${ALERT_TONES[tone].border}`,
        );
        expect(html).toContain(`color:${ALERT_TONES[tone].text}`);
        expect(html).toContain('mensagem');
      },
    );
  });

  describe('emailCode', () => {
    it('renderiza o valor em monospace com letter-spacing', () => {
      const html = emailCode('X9K2');
      expect(html).toContain("font-family:'Courier New',monospace");
      expect(html).toContain('letter-spacing:1px');
      expect(html).toContain('X9K2');
    });
  });
});
