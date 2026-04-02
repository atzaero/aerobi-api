import type { PrivateAerodromesSyncState } from '@/generated/prisma/client';

export type PrivateAerodromesSyncStateApiRow = Omit<
  PrivateAerodromesSyncState,
  'contentLength'
> & {
  contentLength: string | null;
};

export class PrivateAerodromesSyncStateMapper {
  static toApiRow(
    state: PrivateAerodromesSyncState,
  ): PrivateAerodromesSyncStateApiRow {
    return {
      ...state,
      contentLength:
        state.contentLength === null ? null : state.contentLength.toString(),
    };
  }

  static toApiRows(
    states: PrivateAerodromesSyncState[],
  ): PrivateAerodromesSyncStateApiRow[] {
    return states.map((s) => PrivateAerodromesSyncStateMapper.toApiRow(s));
  }
}
