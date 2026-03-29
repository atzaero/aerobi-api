import type { RabSyncState } from '@/generated/prisma/client';

export type UpsertRunningRabSyncStateInput = {
  period: string;
  sourceUrl: string;
  lastModified: string | undefined;
  contentLength: bigint | null;
};

export type UpdateSuccessRabSyncStateInput = {
  contentHash: string;
  parsedRowCount: number;
  syncedAt: Date;
};

export interface IRabSyncStateRepository {
  findByPeriod(period: string): Promise<RabSyncState | null>;
  upsertRunning(input: UpsertRunningRabSyncStateInput): Promise<void>;
  updateSuccess(
    period: string,
    data: UpdateSuccessRabSyncStateInput,
  ): Promise<void>;
  updateFailed(period: string, errorMessage: string): Promise<void>;
  findManyOrderByPeriodDesc(): Promise<RabSyncState[]>;
}
