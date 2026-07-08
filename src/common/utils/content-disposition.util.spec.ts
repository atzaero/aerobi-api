import { buildAttachmentContentDisposition } from './content-disposition.util';

describe('buildAttachmentContentDisposition', () => {
  it('inclui fallback ASCII e filename UTF-8', () => {
    const header = buildAttachmentContentDisposition('visita-tecnica-SBCF.pdf');
    expect(header).toBe(
      'attachment; filename="visita-tecnica-SBCF.pdf"; filename*=UTF-8\'\'visita-tecnica-SBCF.pdf',
    );
  });

  it('sanitiza caracteres não-ASCII no fallback', () => {
    const header = buildAttachmentContentDisposition('visita-ção.pdf');
    expect(header).toContain('filename="visita-__o.pdf"');
    expect(header).toContain("filename*=UTF-8''visita-%C3%A7%C3%A3o.pdf");
  });
});
