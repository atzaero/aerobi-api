import { Injectable } from '@nestjs/common';
import { PublicAerodromesSyncStatus } from '@/generated/prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PublicAerodromesSyncStateRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByDatasetKey(datasetKey: string) {
    return this.prisma.publicAerodromesSyncState.findUnique({
      where: { datasetKey },
    });
  }

  async upsertRunning(input: {
    datasetKey: string;
    sourceUrl: string;
    datasetVersion: string | null;
    lastModified: string | null;
    contentLength: bigint | null;
  }): Promise<void> {
    const {
      datasetKey,
      sourceUrl,
      datasetVersion,
      lastModified,
      contentLength,
    } = input;
    await this.prisma.publicAerodromesSyncState.upsert({
      where: { datasetKey },
      create: {
        datasetKey,
        sourceUrl,
        datasetVersion,
        lastModified,
        contentLength,
        status: PublicAerodromesSyncStatus.RUNNING,
        errorMessage: null,
      },
      update: {
        sourceUrl,
        datasetVersion,
        lastModified,
        contentLength,
        status: PublicAerodromesSyncStatus.RUNNING,
        errorMessage: null,
      },
    });
  }

  async updateSuccess(
    datasetKey: string,
    data: { contentHash: string; parsedRowCount: number; syncedAt: Date },
  ): Promise<void> {
    await this.prisma.publicAerodromesSyncState.update({
      where: { datasetKey },
      data: {
        contentHash: data.contentHash,
        parsedRowCount: data.parsedRowCount,
        syncedAt: data.syncedAt,
        status: PublicAerodromesSyncStatus.SUCCESS,
        errorMessage: null,
      },
    });
  }

  async updateFailed(datasetKey: string, errorMessage: string): Promise<void> {
    await this.prisma.publicAerodromesSyncState.update({
      where: { datasetKey },
      data: {
        status: PublicAerodromesSyncStatus.FAILED,
        errorMessage,
      },
    });
  }

  findManyOrderBySyncedAtDesc() {
    return this.prisma.publicAerodromesSyncState.findMany({
      orderBy: [{ syncedAt: 'desc' }, { datasetKey: 'asc' }],
    });
  }

  findLatestSuccessful() {
    return this.prisma.publicAerodromesSyncState.findFirst({
      where: { status: PublicAerodromesSyncStatus.SUCCESS },
      orderBy: { syncedAt: 'desc' },
    });
  }
}
