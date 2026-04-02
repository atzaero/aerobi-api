import { Injectable, Logger } from '@nestjs/common';
import { PrivateAerodromesSyncStatus } from '@/generated/prisma/client';
import { createHash } from 'node:crypto';

import { SyncPrivateAerodromesDto } from '../dtos/sync-private-aerodromes.dto';
import { PrivateAerodromeRepository } from '../repositories/private-aerodrome.repository';
import { PrivateAerodromesSyncStateRepository } from '../repositories/private-aerodromes-sync-state.repository';
import type { SyncResult } from '../types/sync-result.type';

import { AnacPrivateAerodromesSourceService } from './anac-private-aerodromes-source.service';
import { PrivateAerodromesCsvParserService } from './private-aerodromes-csv-parser.service';

function pickHeader(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | undefined {
  const direct = headers[name];
  if (Array.isArray(direct)) {
    return direct[0];
  }
  if (typeof direct === 'string') {
    return direct;
  }
  const lower = name.toLowerCase();
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === lower) {
      const v = headers[key];
      if (Array.isArray(v)) {
        return v[0];
      }
      if (typeof v === 'string') {
        return v;
      }
    }
  }
  return undefined;
}

const DATASET_KEY = 'private_aerodromes';

@Injectable()
export class PrivateAerodromesSyncService {
  private readonly logger = new Logger(PrivateAerodromesSyncService.name);

  constructor(
    private readonly source: AnacPrivateAerodromesSourceService,
    private readonly syncStateRepo: PrivateAerodromesSyncStateRepository,
    private readonly parser: PrivateAerodromesCsvParserService,
    private readonly aerodromeRepo: PrivateAerodromeRepository,
  ) {}

  async execute(dto: SyncPrivateAerodromesDto = {}): Promise<SyncResult> {
    const force = dto.force ?? false;
    const csvUrl = this.source.getCsvUrl();
    const headResp = await this.source.head();
    const h = headResp.headers as Record<string, string | string[] | undefined>;
    const lastModified = pickHeader(h, 'last-modified');
    const lastModifiedOrNull = lastModified ?? null;
    const clStr = pickHeader(h, 'content-length');
    const contentLength =
      clStr !== undefined && clStr !== '' ? BigInt(clStr) : null;

    const existing = await this.syncStateRepo.findByDatasetKey(DATASET_KEY);
    if (
      existing &&
      !force &&
      existing.lastModified === lastModifiedOrNull &&
      existing.contentLength === contentLength &&
      existing.status === PrivateAerodromesSyncStatus.SUCCESS
    ) {
      this.logger.log('Private aerodromes: HEAD inalterado, skip.');
      return {
        datasetKey: DATASET_KEY,
        skipped: true,
        reason: 'unchanged_head',
        rowCount: existing.parsedRowCount ?? undefined,
      };
    }

    const getResp = await this.source.download();
    const gh = getResp.headers as Record<string, string | string[] | undefined>;
    const contentType = pickHeader(gh, 'content-type');
    const buffer = Buffer.from(getResp.data);
    const hash = createHash('sha256').update(buffer).digest('hex');

    if (
      existing &&
      !force &&
      existing.contentHash === hash &&
      existing.status === PrivateAerodromesSyncStatus.SUCCESS
    ) {
      this.logger.log('Private aerodromes: hash idêntico, skip parse/upsert.');
      return {
        datasetKey: DATASET_KEY,
        skipped: true,
        reason: 'unchanged_hash',
        rowCount: existing.parsedRowCount ?? undefined,
      };
    }

    const datasetVersion = this.source.extractDatasetVersionFromCsv(buffer);
    await this.syncStateRepo.upsertRunning({
      datasetKey: DATASET_KEY,
      sourceUrl: csvUrl,
      datasetVersion,
      lastModified: lastModifiedOrNull,
      contentLength,
    });

    try {
      const rows = this.parser.parseBuffer(buffer, { contentType });
      await this.aerodromeRepo.upsertBatch(rows);
      await this.syncStateRepo.updateSuccess(DATASET_KEY, {
        contentHash: hash,
        parsedRowCount: rows.length,
        syncedAt: new Date(),
      });
      this.logger.log(`Private aerodromes: ${rows.length} linhas upsert.`);
      return { datasetKey: DATASET_KEY, skipped: false, rowCount: rows.length };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      await this.syncStateRepo.updateFailed(DATASET_KEY, message);
      throw e;
    }
  }
}
