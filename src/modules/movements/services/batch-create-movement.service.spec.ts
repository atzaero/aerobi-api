import type { EventEmitter2 } from '@nestjs/event-emitter';

import { MovementSource, MovementType } from '@/generated/prisma/enums';

import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { ErrorMessageService } from '@/common/error-messages/error-message.service';

import type { MovementCreatedEvent } from '../events/movement-created.event';
import { MOVEMENTS_BATCH_CREATED_EVENT } from '../events/movements-batch-created.event';
import type {
  CreateMovementOptions,
  CreateMovementService,
} from './create-movement.service';
import { BatchCreateMovementService } from './batch-create-movement.service';

describe('BatchCreateMovementService', () => {
  let service: BatchCreateMovementService;
  let execute: jest.Mock;
  let emit: jest.Mock;

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
    emit = jest.fn();
    const createService = {
      execute,
    } as unknown as CreateMovementService;
    const errors = {
      getMessage: jest.fn().mockReturnValue('validação falhou'),
    } as unknown as ErrorMessageService;
    const eventEmitter = { emit } as unknown as EventEmitter2;
    service = new BatchCreateMovementService(
      createService,
      errors,
      eventEmitter,
    );
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
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ registration: 'PR-ZTT' }),
      { source: MovementSource.AUTOMATIC, createdBy: 'aviascan' },
      expect.anything(),
      expect.objectContaining({ batched: true }),
    );
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

  it('emite movements.batch.created com os movimentos coletados (resumo agregado)', async () => {
    const evA: MovementCreatedEvent = {
      movementId: 'r-1',
      registration: 'PRZTT',
      aerodrome: 'SSCF',
      operationType: MovementType.LANDING,
      source: MovementSource.AUTOMATIC,
      readingDatetime: new Date('2026-06-08T16:52:39Z'),
      batched: true,
    };
    const evB: MovementCreatedEvent = {
      ...evA,
      movementId: 'r-2',
      registration: 'PSABC',
      aerodrome: 'SBSP',
      operationType: MovementType.TAKEOFF,
    };
    execute
      .mockImplementationOnce(
        (
          _dto: unknown,
          _origin: unknown,
          _img: unknown,
          opts: CreateMovementOptions,
        ) => {
          opts.onCreated?.(evA);
          return Promise.resolve({ id: 'r-1', image_path: null });
        },
      )
      .mockImplementationOnce(
        (
          _dto: unknown,
          _origin: unknown,
          _img: unknown,
          opts: CreateMovementOptions,
        ) => {
          opts.onCreated?.(evB);
          return Promise.resolve({ id: 'r-2', image_path: null });
        },
      );

    const metadata = JSON.stringify([
      validItem(),
      validItem({ registration: 'PS-ABC', aerodrome: 'SBSP' }),
    ]);
    await service.execute(metadata, []);

    expect(emit).toHaveBeenCalledWith(MOVEMENTS_BATCH_CREATED_EVENT, {
      movements: [evA, evB],
    });
  });

  it('não emite movements.batch.created quando nada foi criado', async () => {
    execute.mockRejectedValue(new Error('db timeout'));

    await service.execute(JSON.stringify([validItem()]), []);

    expect(emit).not.toHaveBeenCalled();
  });
});
