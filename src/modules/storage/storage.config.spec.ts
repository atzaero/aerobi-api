import {
  DEFAULT_STORAGE_BUCKET,
  DEFAULT_STORAGE_REGION,
  resolveStorageBucket,
  resolveStorageRegion,
} from './storage.config';

const from =
  (map: Record<string, string | undefined>) =>
  (key: string): string | undefined =>
    map[key];

describe('resolveStorageBucket', () => {
  it('usa MINIO_BUCKET', () => {
    expect(resolveStorageBucket(from({ MINIO_BUCKET: 'aerobi-prod' }))).toBe(
      'aerobi-prod',
    );
  });

  it('usa o default quando nada está setado ou vazio', () => {
    expect(resolveStorageBucket(from({}))).toBe(DEFAULT_STORAGE_BUCKET);
    expect(resolveStorageBucket(from({ MINIO_BUCKET: '   ' }))).toBe(
      DEFAULT_STORAGE_BUCKET,
    );
  });
});

describe('resolveStorageRegion', () => {
  it('prefere MINIO_REGION, senão o default', () => {
    expect(resolveStorageRegion(from({ MINIO_REGION: 'us-east-1' }))).toBe(
      'us-east-1',
    );
    expect(resolveStorageRegion(from({}))).toBe(DEFAULT_STORAGE_REGION);
  });
});
