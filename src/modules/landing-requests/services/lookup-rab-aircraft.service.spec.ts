import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { RabRow } from '@/generated/prisma/client';
import type { RabRowRepository } from '@/modules/rab/repositories/rab-row.repository';

import { LookupRabAircraftService } from './lookup-rab-aircraft.service';

describe('LookupRabAircraftService', () => {
  let service: LookupRabAircraftService;
  let findLatestByMarcas: jest.Mock;

  beforeEach(() => {
    findLatestByMarcas = jest.fn();
    service = new LookupRabAircraftService(
      { findLatestByMarcas } as unknown as RabRowRepository,
      new ErrorMessageService(),
    );
  });

  it('matrícula estrangeira: pula o RAB (null) sem consultar', async () => {
    const out = await service.execute('N12345', true);
    expect(out).toBeNull();
    expect(findLatestByMarcas).not.toHaveBeenCalled();
  });

  it('nacional encontrada: normaliza marcas (sem hífen) e retorna o RabRow', async () => {
    const row = { period: '2026-07', marcas: 'PTABC' } as RabRow;
    findLatestByMarcas.mockResolvedValue(row);
    const out = await service.execute('PT-ABC', false);
    expect(findLatestByMarcas).toHaveBeenCalledWith('PTABC');
    expect(out).toBe(row);
  });

  it('nacional não encontrada → VALIDATION_FAILED', async () => {
    findLatestByMarcas.mockResolvedValue(null);
    await expect(service.execute('PT-XYZ', false)).rejects.toBeInstanceOf(
      CustomHttpException,
    );
  });
});
