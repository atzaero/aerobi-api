import type { HttpService } from '@nestjs/axios';
import { createHash } from 'node:crypto';
import { of } from 'rxjs';

import { RabSyncStatus, type RabSyncState } from '@/generated/prisma/client';

import type { RabRowRepository } from '../repositories/rab-row.repository';
import type { RabSyncStateRepository } from '../repositories/rab-sync-state.repository';

import type { AnacIndexService } from './anac-index.service';
import type { RabCsvParserService } from './rab-csv-parser.service';
import { RabSyncService } from './rab-sync.service';

const CSV_URL = 'https://anac.example/2026-03.csv';
const CSV_BUFFER = Buffer.from('MARCAS;PROPRIETARIOS\nPPABC;Fulano');
const CSV_HASH = createHash('sha256').update(CSV_BUFFER).digest('hex');

function existingState(overrides: Partial<RabSyncState>): RabSyncState {
  return {
    id: 'state-1',
    period: '2026-03',
    sourceUrl: CSV_URL,
    lastModified: null,
    contentLength: null,
    contentHash: null,
    parsedRowCount: null,
    syncedAt: null,
    status: RabSyncStatus.PENDING,
    errorMessage: null,
    ...overrides,
  };
}

describe('RabSyncService', () => {
  let service: RabSyncService;
  let head: jest.Mock;
  let get: jest.Mock;
  let findByPeriod: jest.Mock;
  let upsertRunning: jest.Mock;
  let updateSuccess: jest.Mock;
  let updateFailed: jest.Mock;
  let execute: jest.Mock;
  let csvUrlForPeriod: jest.Mock;
  let parseBuffer: jest.Mock;
  let upsertBatch: jest.Mock;

  beforeEach(() => {
    head = jest.fn().mockReturnValue(
      of({
        headers: { 'last-modified': 'MOD-A', 'content-length': '2048' },
      }),
    );
    get = jest
      .fn()
      .mockReturnValue(
        of({ headers: { 'content-type': 'text/csv' }, data: CSV_BUFFER }),
      );
    findByPeriod = jest.fn().mockResolvedValue(null);
    upsertRunning = jest.fn().mockResolvedValue(undefined);
    updateSuccess = jest.fn().mockResolvedValue(undefined);
    updateFailed = jest.fn().mockResolvedValue(undefined);
    execute = jest.fn().mockResolvedValue('2026-03');
    csvUrlForPeriod = jest.fn().mockReturnValue(CSV_URL);
    parseBuffer = jest.fn().mockReturnValue([{ marcas: 'PPABC' }]);
    upsertBatch = jest.fn().mockResolvedValue(undefined);

    const http = { head, get } as unknown as HttpService;
    const syncStateRepo = {
      findByPeriod,
      upsertRunning,
      updateSuccess,
      updateFailed,
    } as unknown as RabSyncStateRepository;
    const index = { execute, csvUrlForPeriod } as unknown as AnacIndexService;
    const parser = { parseBuffer } as unknown as RabCsvParserService;
    const rowRepo = { upsertBatch } as unknown as RabRowRepository;

    service = new RabSyncService(http, syncStateRepo, index, parser, rowRepo);
  });

  describe('resolução do período', () => {
    it('usa o period do DTO sem consultar o índice ANAC', async () => {
      const result = await service.execute({ period: '2026-03' });

      expect(execute).not.toHaveBeenCalled();
      expect(csvUrlForPeriod).toHaveBeenCalledWith('2026-03');
      expect(result).toEqual({
        period: '2026-03',
        skipped: false,
        rowCount: 1,
      });
    });

    it('resolve o período mais recente pelo índice quando o DTO é vazio', async () => {
      await service.execute({});

      expect(execute).toHaveBeenCalledTimes(1);
      expect(csvUrlForPeriod).toHaveBeenCalledWith('2026-03');
    });
  });

  describe('sincronização completa', () => {
    it('faz upsertRunning → parse → upsertBatch → updateSuccess', async () => {
      const result = await service.execute({ period: '2026-03' });

      expect(upsertRunning).toHaveBeenCalledWith({
        period: '2026-03',
        sourceUrl: CSV_URL,
        lastModified: 'MOD-A',
        contentLength: BigInt(2048),
      });
      expect(parseBuffer).toHaveBeenCalledWith(expect.any(Buffer), '2026-03', {
        contentType: 'text/csv',
      });
      expect(upsertBatch).toHaveBeenCalledTimes(1);
      expect(updateSuccess).toHaveBeenCalledWith(
        '2026-03',
        expect.objectContaining({ contentHash: CSV_HASH, parsedRowCount: 1 }),
      );
      expect(result).toEqual({
        period: '2026-03',
        skipped: false,
        rowCount: 1,
      });
    });

    it('trata content-length ausente como contentLength null', async () => {
      head.mockReturnValue(of({ headers: { 'last-modified': 'MOD-A' } }));

      await service.execute({ period: '2026-03' });

      expect(upsertRunning).toHaveBeenCalledWith(
        expect.objectContaining({ contentLength: null }),
      );
    });
  });

  describe('skips idempotentes', () => {
    it('pula (unchanged_head) quando SUCCESS e Last-Modified/Content-Length batem', async () => {
      findByPeriod.mockResolvedValue(
        existingState({
          status: RabSyncStatus.SUCCESS,
          lastModified: 'MOD-A',
          contentLength: BigInt(2048),
          parsedRowCount: 5,
        }),
      );

      const result = await service.execute({ period: '2026-03' });

      expect(result).toEqual({
        period: '2026-03',
        skipped: true,
        reason: 'unchanged_head',
        rowCount: 5,
      });
      expect(get).not.toHaveBeenCalled();
      expect(upsertRunning).not.toHaveBeenCalled();
    });

    it('pula (unchanged_hash) quando o HEAD mudou mas o hash do corpo é idêntico', async () => {
      findByPeriod.mockResolvedValue(
        existingState({
          status: RabSyncStatus.SUCCESS,
          lastModified: 'MOD-ANTIGO',
          contentLength: BigInt(999),
          contentHash: CSV_HASH,
          parsedRowCount: 7,
        }),
      );

      const result = await service.execute({ period: '2026-03' });

      expect(result).toEqual({
        period: '2026-03',
        skipped: true,
        reason: 'unchanged_hash',
        rowCount: 7,
      });
      expect(upsertRunning).not.toHaveBeenCalled();
      expect(parseBuffer).not.toHaveBeenCalled();
    });

    it('force=true ignora o skip de HEAD e reprocessa', async () => {
      findByPeriod.mockResolvedValue(
        existingState({
          status: RabSyncStatus.SUCCESS,
          lastModified: 'MOD-A',
          contentLength: BigInt(2048),
          parsedRowCount: 5,
        }),
      );

      const result = await service.execute({ period: '2026-03', force: true });

      expect(get).toHaveBeenCalled();
      expect(upsertBatch).toHaveBeenCalled();
      expect(result.skipped).toBe(false);
    });
  });

  describe('falha', () => {
    it('marca updateFailed e propaga o erro quando o parse falha', async () => {
      parseBuffer.mockImplementation(() => {
        throw new Error('parse boom');
      });

      await expect(service.execute({ period: '2026-03' })).rejects.toThrow(
        'parse boom',
      );
      expect(upsertRunning).toHaveBeenCalled();
      expect(updateFailed).toHaveBeenCalledWith('2026-03', 'parse boom');
      expect(updateSuccess).not.toHaveBeenCalled();
    });
  });
});
