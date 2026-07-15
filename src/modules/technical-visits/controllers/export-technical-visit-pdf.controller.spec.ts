import type { Response } from 'express';

import { TechnicalVisitParamDTO } from '../dtos/technical-visit-param.dto';
import type { ExportTechnicalVisitPdfService } from '../services/export-technical-visit-pdf.service';

import { ExportTechnicalVisitPdfController } from './export-technical-visit-pdf.controller';

const visitId = '11111111-1111-4111-8111-111111111111';

function mockResponse(): { res: Response; set: jest.Mock; send: jest.Mock } {
  const set = jest.fn();
  const send = jest.fn();
  return { res: { set, send } as unknown as Response, set, send };
}

describe('ExportTechnicalVisitPdfController', () => {
  let controller: ExportTechnicalVisitPdfController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ExportTechnicalVisitPdfController({
      execute,
    } as unknown as ExportTechnicalVisitPdfService);
  });

  it('delega ao service e envia o buffer', async () => {
    const params: TechnicalVisitParamDTO = { technicalVisitId: visitId };
    const buffer = Buffer.from('pdf');
    execute.mockResolvedValue({
      buffer,
      filename: 'visita-tecnica-SBCF.pdf',
    });
    const { res, send } = mockResponse();

    await controller.handle(params, res);

    expect(execute).toHaveBeenCalledWith(visitId);
    expect(send).toHaveBeenCalledWith(buffer);
  });

  it('seta Content-Type e Content-Disposition após o service resolver', async () => {
    const params: TechnicalVisitParamDTO = { technicalVisitId: visitId };
    execute.mockResolvedValue({
      buffer: Buffer.from('pdf'),
      filename: 'visita-tecnica-SBCF.pdf',
    });
    const { res, set } = mockResponse();

    await controller.handle(params, res);

    expect(set).toHaveBeenCalledWith({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'attachment; filename="visita-tecnica-SBCF.pdf"; filename*=UTF-8\'\'visita-tecnica-SBCF.pdf',
    });
  });

  it('não seta headers quando o service lança', async () => {
    const params: TechnicalVisitParamDTO = { technicalVisitId: visitId };
    execute.mockRejectedValue(new Error('boom'));
    const { res, set, send } = mockResponse();

    await expect(controller.handle(params, res)).rejects.toThrow('boom');
    expect(set).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
});
