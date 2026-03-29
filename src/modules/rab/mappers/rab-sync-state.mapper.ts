import type { RabSyncState } from '@/generated/prisma/client';

/** Serializa `contentLength` (BigInt) para string na resposta JSON. */
export type RabSyncStateApiRow = Omit<RabSyncState, 'contentLength'> & {
  contentLength: string | null;
};

export class RabSyncStateMapper {
  static toApiRow(state: RabSyncState): RabSyncStateApiRow {
    return {
      ...state,
      contentLength:
        state.contentLength === null ? null : state.contentLength.toString(),
    };
  }

  static toApiRows(states: RabSyncState[]): RabSyncStateApiRow[] {
    return states.map((s) => RabSyncStateMapper.toApiRow(s));
  }
}
