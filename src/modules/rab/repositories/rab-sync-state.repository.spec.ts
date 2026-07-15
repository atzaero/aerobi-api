import { RabSyncStatus } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

import { RabSyncStateRepository } from './rab-sync-state.repository';

describe('RabSyncStateRepository', () => {
  let repository: RabSyncStateRepository;
  let findUnique: jest.Mock;
  let upsert: jest.Mock;
  let update: jest.Mock;
  let findMany: jest.Mock;

  beforeEach(() => {
    findUnique = jest.fn().mockResolvedValue(null);
    upsert = jest.fn().mockResolvedValue(undefined);
    update = jest.fn().mockResolvedValue(undefined);
    findMany = jest.fn().mockResolvedValue([]);
    const prisma = {
      rabSyncState: { findUnique, upsert, update, findMany },
    } as unknown as PrismaService;
    repository = new RabSyncStateRepository(prisma);
  });

  it('findByPeriod: busca por período único', async () => {
    await repository.findByPeriod('2026-03');

    expect(findUnique).toHaveBeenCalledWith({ where: { period: '2026-03' } });
  });

  it('upsertRunning: create e update marcam RUNNING e limpam errorMessage', async () => {
    await repository.upsertRunning({
      period: '2026-03',
      sourceUrl: 'https://anac/2026-03.csv',
      lastModified: 'Mon, 02 Mar 2026 00:00:00 GMT',
      contentLength: BigInt(1024),
    });

    expect(upsert).toHaveBeenCalledWith({
      where: { period: '2026-03' },
      create: {
        period: '2026-03',
        sourceUrl: 'https://anac/2026-03.csv',
        lastModified: 'Mon, 02 Mar 2026 00:00:00 GMT',
        contentLength: BigInt(1024),
        status: RabSyncStatus.RUNNING,
        errorMessage: null,
      },
      update: {
        sourceUrl: 'https://anac/2026-03.csv',
        lastModified: 'Mon, 02 Mar 2026 00:00:00 GMT',
        contentLength: BigInt(1024),
        status: RabSyncStatus.RUNNING,
        errorMessage: null,
      },
    });
  });

  it('updateSuccess: marca SUCCESS com hash/contagem/data e limpa erro', async () => {
    const syncedAt = new Date('2026-03-02T00:00:00.000Z');

    await repository.updateSuccess('2026-03', {
      contentHash: 'hash-x',
      parsedRowCount: 99,
      syncedAt,
    });

    expect(update).toHaveBeenCalledWith({
      where: { period: '2026-03' },
      data: {
        contentHash: 'hash-x',
        parsedRowCount: 99,
        syncedAt,
        status: RabSyncStatus.SUCCESS,
        errorMessage: null,
      },
    });
  });

  it('updateFailed: marca FAILED com a mensagem de erro', async () => {
    await repository.updateFailed('2026-03', 'boom');

    expect(update).toHaveBeenCalledWith({
      where: { period: '2026-03' },
      data: { status: RabSyncStatus.FAILED, errorMessage: 'boom' },
    });
  });

  it('findManyOrderByPeriodDesc: ordena por período desc', async () => {
    await repository.findManyOrderByPeriodDesc();

    expect(findMany).toHaveBeenCalledWith({ orderBy: { period: 'desc' } });
  });
});
