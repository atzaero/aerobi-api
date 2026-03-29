import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { RabSyncStatus } from '@/generated/prisma/client';
import { createHash } from 'node:crypto';
import { firstValueFrom } from 'rxjs';

import { SyncRabDto } from '../dtos/sync-rab.dto';
import { RabRowRepository } from '../repositories/rab-row.repository';
import { RabSyncStateRepository } from '../repositories/rab-sync-state.repository';
import type { SyncResult } from '../types/sync-result.type';

import { AnacIndexService } from './anac-index.service';
import { RabCsvParserService } from './rab-csv-parser.service';

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

export type { SyncResult } from '../types/sync-result.type';

@Injectable()
export class RabSyncService {
  private readonly logger = new Logger(RabSyncService.name);

  constructor(
    private readonly http: HttpService,
    private readonly syncStateRepo: RabSyncStateRepository,
    private readonly index: AnacIndexService,
    private readonly parser: RabCsvParserService,
    private readonly rowRepo: RabRowRepository,
  ) {}

  async execute(dto: SyncRabDto = {}): Promise<SyncResult> {
    if (dto.period) {
      return this.syncPeriod(dto.period, dto.force ?? false);
    }
    return this.syncLatestPeriod();
  }

  private async syncLatestPeriod(): Promise<SyncResult> {
    const period = await this.index.execute();
    return this.syncPeriod(period, false);
  }

  /**
   * HEAD no CSV; se Last-Modified e Content-Length iguais ao estado, pula GET.
   * Após GET, hash SHA-256 evita reprocessar arquivo idêntico.
   */
  private async syncPeriod(
    period: string,
    force: boolean,
  ): Promise<SyncResult> {
    const csvUrl = this.index.csvUrlForPeriod(period);
    const headResp = await firstValueFrom(this.http.head(csvUrl));
    const h = headResp.headers as Record<string, string | string[] | undefined>;

    const lastModified = pickHeader(h, 'last-modified');
    const clStr = pickHeader(h, 'content-length');
    const contentLength =
      clStr !== undefined && clStr !== '' ? BigInt(clStr) : null;

    const existing = await this.syncStateRepo.findByPeriod(period);

    if (
      !force &&
      existing?.status === RabSyncStatus.SUCCESS &&
      existing.lastModified === lastModified &&
      existing.contentLength === contentLength
    ) {
      this.logger.log(
        `Período ${period}: HEAD inalterado (Last-Modified / Content-Length), skip.`,
      );
      return {
        period,
        skipped: true,
        reason: 'unchanged_head',
        rowCount: existing.parsedRowCount ?? undefined,
      };
    }

    const getResp = await firstValueFrom(
      this.http.get<ArrayBuffer>(csvUrl, { responseType: 'arraybuffer' }),
    );
    const gh = getResp.headers as Record<string, string | string[] | undefined>;
    const contentType = pickHeader(gh, 'content-type');
    const buffer = Buffer.from(getResp.data);
    const hash = createHash('sha256').update(buffer).digest('hex');

    if (
      !force &&
      existing?.contentHash === hash &&
      existing.status === RabSyncStatus.SUCCESS
    ) {
      this.logger.log(`Período ${period}: hash idêntico, skip parse/upsert.`);
      return {
        period,
        skipped: true,
        reason: 'unchanged_hash',
        rowCount: existing.parsedRowCount ?? undefined,
      };
    }

    await this.syncStateRepo.upsertRunning({
      period,
      sourceUrl: csvUrl,
      lastModified,
      contentLength,
    });

    try {
      const rows = this.parser.parseBuffer(buffer, period, { contentType });
      await this.rowRepo.upsertBatch(rows);

      await this.syncStateRepo.updateSuccess(period, {
        contentHash: hash,
        parsedRowCount: rows.length,
        syncedAt: new Date(),
      });

      this.logger.log(`Período ${period}: ${rows.length} linhas upsert.`);

      return { period, skipped: false, rowCount: rows.length };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      await this.syncStateRepo.updateFailed(period, message);
      throw e;
    }
  }
}
