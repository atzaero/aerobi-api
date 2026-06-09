import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { ErrorMessageService } from '@/common/error-messages/error-message.service';

import type { CreateMovementService } from './create-movement.service';
import { BatchCreateMovementService } from './batch-create-movement.service';

describe('BatchCreateMovementService', () => {
  let service: BatchCreateMovementService;
  let execute: jest.Mock;

  const image = (mimetype = 'image/jpeg') =>
    ({
      originalname: 'foto.jpg',
      mimetype,
      buffer: Buffer.from('img'),
    }) as Express.Multer.File;

  const validItem = (over: Record<string, unknown> = {}) => ({
    registration: 'PR-ZTT',
    confidence: '0.98',
    reading_datetime: '2026-06-08T16:52:39Z',
    aerodrome: 'SSCF',
    ...over,
  });

  beforeEach(() => {
    execute = jest.fn();
    const createService = {
      execute,
    } as unknown as CreateMovementService;
    const errors = {
      getMessage: jest.fn().mockReturnValue('validação falhou'),
    } as unknown as ErrorMessageService;
    service = new BatchCreateMovementService(createService, errors);
  });

  it('processa lote válido: created/failed e items com status', async () => {
    execute
      .mockResolvedValueOnce({ id: 'r-1', image_path: 'url-1' })
      .mockResolvedValueOnce({ id: 'r-2', image_path: null });

    const metadata = JSON.stringify([
      validItem({ image_index: 0 }),
      validItem({ registration: 'PS-ABC' }),
    ]);

    const res = await service.execute(metadata, [image()]);

    expect(execute).toHaveBeenCalledTimes(2);
    expect(res.created).toBe(2);
    expect(res.failed).toBe(0);
    expect(res.items).toEqual([
      {
        index: 0,
        status: 'created',
        id: 'r-1',
        image_path: 'url-1',
        error: null,
      },
      { index: 1, status: 'created', id: 'r-2', image_path: null, error: null },
    ]);
  });

  it('falha parcial não derruba o lote: item falho vira status=failed', async () => {
    execute
      .mockResolvedValueOnce({ id: 'r-1', image_path: null })
      .mockRejectedValueOnce(new Error('db timeout'));

    const metadata = JSON.stringify([
      validItem(),
      validItem({ registration: 'PS-ABC' }),
    ]);

    const res = await service.execute(metadata, []);

    expect(res.created).toBe(1);
    expect(res.failed).toBe(1);
    expect(res.items[0]).toMatchObject({
      index: 0,
      status: 'created',
      id: 'r-1',
    });
    expect(res.items[1]).toMatchObject({
      index: 1,
      status: 'failed',
      id: null,
      error: 'db timeout',
    });
  });

  it('400 quando metadata não é JSON válido', async () => {
    await expect(service.execute('{nao-json', [])).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(execute).not.toHaveBeenCalled();
  });

  it('400 quando metadata não é array', async () => {
    await expect(
      service.execute(JSON.stringify(validItem()), []),
    ).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('400 quando metadata é array vazio', async () => {
    await expect(service.execute('[]', [])).rejects.toBeInstanceOf(
      CustomHttpException,
    );
  });

  it('400 quando image_index está fora do intervalo', async () => {
    const metadata = JSON.stringify([validItem({ image_index: 5 })]);
    await expect(service.execute(metadata, [image()])).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(execute).not.toHaveBeenCalled();
  });

  it('400 quando o arquivo referenciado tem mimetype inválido', async () => {
    const metadata = JSON.stringify([validItem({ image_index: 0 })]);
    await expect(
      service.execute(metadata, [image('application/pdf')]),
    ).rejects.toBeInstanceOf(CustomHttpException);
    expect(execute).not.toHaveBeenCalled();
  });

  it('400 quando um item é inválido (sem registration)', async () => {
    const metadata = JSON.stringify([validItem({ registration: '' })]);
    await expect(service.execute(metadata, [])).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(execute).not.toHaveBeenCalled();
  });
});
