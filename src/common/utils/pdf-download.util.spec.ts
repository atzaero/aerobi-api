import type { Response } from 'express';

import { applyPdfDownloadHeaders } from './pdf-download.util';

describe('applyPdfDownloadHeaders', () => {
  it('seta Content-Type application/pdf e Content-Disposition de anexo', () => {
    const set = jest.fn();
    const res = { set } as unknown as Response;

    applyPdfDownloadHeaders(res, 'visita-tecnica-sbgr.pdf');

    expect(set).toHaveBeenCalledWith({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'attachment; filename="visita-tecnica-sbgr.pdf"; filename*=UTF-8\'\'visita-tecnica-sbgr.pdf',
    });
  });
});
