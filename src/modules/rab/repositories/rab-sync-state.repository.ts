import { Injectable } from '@nestjs/common';
import { RabSyncStatus } from '@/generated/prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

import type {
  IRabSyncStateRepository,
  UpdateSuccessRabSyncStateInput,
  UpsertRunningRabSyncStateInput,
} from '../contracts/rab-sync-state-repository.interface';

@Injectable()
export class RabSyncStateRepository implements IRabSyncStateRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByPeriod(period: string) {
    return this.prisma.rabSyncState.findUnique({ where: { period } });
  }

  async upsertRunning(input: UpsertRunningRabSyncStateInput): Promise<void> {
    const { period, sourceUrl, lastModified, contentLength } = input;
    await this.prisma.rabSyncState.upsert({
      where: { period },
      create: {
        period,
        sourceUrl,
        lastModified,
        contentLength,
        status: RabSyncStatus.RUNNING,
        errorMessage: null,
      },
      update: {
        sourceUrl,
        lastModified,
        contentLength,
        status: RabSyncStatus.RUNNING,
        errorMessage: null,
      },
    });
  }

  async updateSuccess(
    period: string,
    data: UpdateSuccessRabSyncStateInput,
  ): Promise<void> {
    await this.prisma.rabSyncState.update({
      where: { period },
      data: {
        contentHash: data.contentHash,
        parsedRowCount: data.parsedRowCount,
        syncedAt: data.syncedAt,
        status: RabSyncStatus.SUCCESS,
        errorMessage: null,
      },
    });
  }

  async updateFailed(period: string, errorMessage: string): Promise<void> {
    await this.prisma.rabSyncState.update({
      where: { period },
      data: {
        status: RabSyncStatus.FAILED,
        errorMessage,
      },
    });
  }

  findManyOrderByPeriodDesc() {
    return this.prisma.rabSyncState.findMany({
      orderBy: { period: 'desc' },
    });
  }
}
