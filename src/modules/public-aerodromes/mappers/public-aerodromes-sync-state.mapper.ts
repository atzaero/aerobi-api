import type { PublicAerodromesSyncState } from '@/generated/prisma/client';

export type PublicAerodromesSyncStateApiRow = Omit<
  PublicAerodromesSyncState,
  'contentLength'
> & {
  contentLength: string | null;
};

export class PublicAerodromesSyncStateMapper {
  static toApiRow(
    state: PublicAerodromesSyncState,
  ): PublicAerodromesSyncStateApiRow {
    return {
      ...state,
      contentLength:
        state.contentLength === null ? null : state.contentLength.toString(),
    };
  }

  static toApiRows(
    states: PublicAerodromesSyncState[],
  ): PublicAerodromesSyncStateApiRow[] {
    return states.map((s) => PublicAerodromesSyncStateMapper.toApiRow(s));
  }
}
