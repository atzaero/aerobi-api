export type SyncResult = {
  datasetKey: string;
  skipped: boolean;
  reason?: 'unchanged_head' | 'unchanged_hash';
  rowCount?: number;
};
