import type { PrivateAerodromesSyncState } from '@/generated/prisma/client';
import { PrivateAerodromesSyncStatus } from '@/generated/prisma/client';
import { createHash } from 'node:crypto';

import { PrivateAerodromeRepository } from '../repositories/private-aerodrome.repository';
import { PrivateAerodromesSyncStateRepository } from '../repositories/private-aerodromes-sync-state.repository';

import { AnacPrivateAerodromesSourceService } from './anac-private-aerodromes-source.service';
import { PrivateAerodromesCsvParserService } from './private-aerodromes-csv-parser.service';
import { PrivateAerodromesSyncService } from './private-aerodromes-sync.service';

const DATASET_KEY = 'private_aerodromes';
const CSV_URL = 'https://example.com/aerodromes.csv';

function makeCsvArrayBuffer(
  content = 'Atualizado em: 2024-01-15\nSJXX;Nome',
): ArrayBuffer {
  const buf = Buffer.from(content, 'utf-8');
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

function hashArrayBuffer(ab: ArrayBuffer): string {
  return createHash('sha256').update(Buffer.from(ab)).digest('hex');
}

function mockSyncState(
  overrides: Partial<PrivateAerodromesSyncState> = {},
): PrivateAerodromesSyncState {
  return {
    id: 'state-1',
    datasetKey: DATASET_KEY,
    sourceUrl: CSV_URL,
    datasetVersion: '2024-01-15',
    lastModified: 'Wed, 15 Jan 2024 00:00:00 GMT',
    contentLength: BigInt(1024),
    contentHash: 'old-hash',
    parsedRowCount: 10,
    syncedAt: new Date('2024-01-15T12:00:00Z'),
    status: PrivateAerodromesSyncStatus.SUCCESS,
    errorMessage: null,
    ...overrides,
  };
}

describe('PrivateAerodromesSyncService', () => {
  let service: PrivateAerodromesSyncService;
  let getCsvUrl: jest.Mock;
  let head: jest.Mock;
  let download: jest.Mock;
  let extractDatasetVersionFromCsv: jest.Mock;
  let findByDatasetKey: jest.Mock;
  let upsertRunning: jest.Mock;
  let updateSuccess: jest.Mock;
  let updateFailed: jest.Mock;
  let parseBuffer: jest.Mock;
  let upsertBatch: jest.Mock;

  const csvArrayBuffer = makeCsvArrayBuffer();
  const csvHash = hashArrayBuffer(csvArrayBuffer);

  beforeEach(() => {
    getCsvUrl = jest.fn().mockReturnValue(CSV_URL);
    head = jest.fn().mockResolvedValue({
      headers: {
        'last-modified': 'Thu, 16 Jan 2025 00:00:00 GMT',
        'content-length': '2048',
      },
    });
    download = jest.fn().mockResolvedValue({
      headers: { 'content-type': 'text/csv; charset=utf-8' },
      data: csvArrayBuffer,
    });
    extractDatasetVersionFromCsv = jest.fn().mockReturnValue('2024-01-15');
    findByDatasetKey = jest.fn().mockResolvedValue(null);
    upsertRunning = jest.fn().mockResolvedValue(undefined);
    updateSuccess = jest.fn().mockResolvedValue(undefined);
    updateFailed = jest.fn().mockResolvedValue(undefined);
    parseBuffer = jest.fn().mockReturnValue([{ ciad: 'SJXX' }]);
    upsertBatch = jest.fn().mockResolvedValue(undefined);

    const source = {
      getCsvUrl,
      head,
      download,
      extractDatasetVersionFromCsv,
    } as unknown as AnacPrivateAerodromesSourceService;

    const syncStateRepo = {
      findByDatasetKey,
      upsertRunning,
      updateSuccess,
      updateFailed,
    } as unknown as PrivateAerodromesSyncStateRepository;

    const parser = {
      parseBuffer,
    } as unknown as PrivateAerodromesCsvParserService;
    const aerodromeRepo = {
      upsertBatch,
    } as unknown as PrivateAerodromeRepository;

    service = new PrivateAerodromesSyncService(
      source,
      syncStateRepo,
      parser,
      aerodromeRepo,
    );
  });

  describe('skip por HEAD inalterado', () => {
    it('retorna skipped=true reason=unchanged_head quando HEAD não mudou', async () => {
      const existing = mockSyncState({
        lastModified: 'Thu, 16 Jan 2025 00:00:00 GMT',
        contentLength: BigInt(2048),
        status: PrivateAerodromesSyncStatus.SUCCESS,
      });
      findByDatasetKey.mockResolvedValue(existing);

      const result = await service.execute({});

      expect(result).toEqual({
        datasetKey: DATASET_KEY,
        skipped: true,
        reason: 'unchanged_head',
        rowCount: existing.parsedRowCount,
      });
      expect(download).not.toHaveBeenCalled();
      expect(upsertRunning).not.toHaveBeenCalled();
    });

    it('ignora skip por HEAD quando force=true', async () => {
      const existing = mockSyncState({
        lastModified: 'Thu, 16 Jan 2025 00:00:00 GMT',
        contentLength: BigInt(2048),
        status: PrivateAerodromesSyncStatus.SUCCESS,
      });
      findByDatasetKey.mockResolvedValue(existing);

      const result = await service.execute({
        force: true,
      });

      expect(result.skipped).toBe(false);
      expect(download).toHaveBeenCalledTimes(1);
    });
  });

  describe('skip por hash idêntico', () => {
    it('retorna skipped=true reason=unchanged_hash quando hash não mudou', async () => {
      const existing = mockSyncState({
        lastModified: 'diferente',
        contentLength: BigInt(9999),
        contentHash: csvHash,
        status: PrivateAerodromesSyncStatus.SUCCESS,
      });
      findByDatasetKey.mockResolvedValue(existing);
      download.mockResolvedValue({
        headers: {},
        data: csvArrayBuffer,
      });

      const result = await service.execute({});

      expect(result).toEqual({
        datasetKey: DATASET_KEY,
        skipped: true,
        reason: 'unchanged_hash',
        rowCount: existing.parsedRowCount,
      });
      expect(upsertRunning).not.toHaveBeenCalled();
    });

    it('ignora skip por hash quando force=true', async () => {
      const existing = mockSyncState({
        contentHash: csvHash,
        status: PrivateAerodromesSyncStatus.SUCCESS,
      });
      findByDatasetKey.mockResolvedValue(existing);
      download.mockResolvedValue({ headers: {}, data: csvArrayBuffer });

      const result = await service.execute({
        force: true,
      });

      expect(result.skipped).toBe(false);
      expect(upsertRunning).toHaveBeenCalledTimes(1);
    });
  });

  describe('sync completo', () => {
    it('executa sync completo quando não há estado existente', async () => {
      findByDatasetKey.mockResolvedValue(null);
      parseBuffer.mockReturnValue([{ ciad: 'SJXX' }, { ciad: 'SJYY' }]);

      const result = await service.execute({});

      expect(result).toMatchObject({
        datasetKey: DATASET_KEY,
        skipped: false,
        rowCount: 2,
      });
      expect(upsertRunning).toHaveBeenCalledTimes(1);
      expect(upsertBatch).toHaveBeenCalledTimes(1);
      expect(updateSuccess).toHaveBeenCalledWith(
        DATASET_KEY,
        expect.objectContaining({ parsedRowCount: 2 }),
      );
    });

    it('executa sync completo quando HEAD é diferente do estado existente', async () => {
      findByDatasetKey.mockResolvedValue(
        mockSyncState({
          lastModified: 'data-antiga',
          contentLength: BigInt(100),
        }),
      );

      const result = await service.execute({});

      expect(result.skipped).toBe(false);
      expect(updateSuccess).toHaveBeenCalledTimes(1);
    });

    it('trata headers ausentes (last-modified e content-length) como null', async () => {
      head.mockResolvedValue({ headers: {} });
      findByDatasetKey.mockResolvedValue(null);

      await service.execute({});

      expect(upsertRunning).toHaveBeenCalledWith(
        expect.objectContaining({
          lastModified: null,
          contentLength: null,
        }),
      );
    });

    it('passa contentType do download para o parser', async () => {
      download.mockResolvedValue({
        headers: { 'content-type': 'text/csv; charset=windows-1252' },
        data: csvArrayBuffer,
      });

      await service.execute({});

      expect(parseBuffer).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.objectContaining({
          contentType: 'text/csv; charset=windows-1252',
        }),
      );
    });
  });

  describe('erros', () => {
    it('propaga erro de source.head()', async () => {
      head.mockRejectedValue(new Error('network timeout'));

      await expect(service.execute({})).rejects.toThrow('network timeout');
      expect(download).not.toHaveBeenCalled();
    });

    it('propaga erro de source.download()', async () => {
      download.mockRejectedValue(new Error('download failed'));

      await expect(service.execute({})).rejects.toThrow('download failed');
      expect(upsertRunning).not.toHaveBeenCalled();
    });

    it('chama updateFailed e re-lança quando parser.parseBuffer lança', async () => {
      parseBuffer.mockImplementation(() => {
        throw new Error('parse error');
      });

      await expect(service.execute({})).rejects.toThrow('parse error');

      expect(updateFailed).toHaveBeenCalledWith(DATASET_KEY, 'parse error');
      expect(upsertBatch).not.toHaveBeenCalled();
      expect(updateSuccess).not.toHaveBeenCalled();
    });

    it('chama updateFailed e re-lança quando aerodromeRepo.upsertBatch rejeita', async () => {
      upsertBatch.mockRejectedValue(new Error('db write error'));

      await expect(service.execute({})).rejects.toThrow('db write error');

      expect(updateFailed).toHaveBeenCalledWith(DATASET_KEY, 'db write error');
      expect(updateSuccess).not.toHaveBeenCalled();
    });
  });
});
