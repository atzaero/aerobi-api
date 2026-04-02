import { Injectable } from '@nestjs/common';
import { PrivateAerodromesSyncStatus } from '@/generated/prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PrivateAerodromesSyncStateRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByDatasetKey(datasetKey: string) {
    return this.prisma.privateAerodromesSyncState.findUnique({
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
    await this.prisma.privateAerodromesSyncState.upsert({
      where: { datasetKey },
      create: {
        datasetKey,
        sourceUrl,
        datasetVersion,
        lastModified,
        contentLength,
        status: PrivateAerodromesSyncStatus.RUNNING,
        errorMessage: null,
      },
      update: {
        sourceUrl,
        datasetVersion,
        lastModified,
        contentLength,
        status: PrivateAerodromesSyncStatus.RUNNING,
        errorMessage: null,
      },
    });
  }

  async updateSuccess(
    datasetKey: string,
    data: { contentHash: string; parsedRowCount: number; syncedAt: Date },
  ): Promise<void> {
    await this.prisma.privateAerodromesSyncState.update({
      where: { datasetKey },
      data: {
        contentHash: data.contentHash,
        parsedRowCount: data.parsedRowCount,
        syncedAt: data.syncedAt,
        status: PrivateAerodromesSyncStatus.SUCCESS,
        errorMessage: null,
      },
    });
  }

  async updateFailed(datasetKey: string, errorMessage: string): Promise<void> {
    await this.prisma.privateAerodromesSyncState.update({
      where: { datasetKey },
      data: {
        status: PrivateAerodromesSyncStatus.FAILED,
        errorMessage,
      },
    });
  }

  findManyOrderBySyncedAtDesc() {
    return this.prisma.privateAerodromesSyncState.findMany({
      orderBy: [{ syncedAt: 'desc' }, { datasetKey: 'asc' }],
    });
  }
}
