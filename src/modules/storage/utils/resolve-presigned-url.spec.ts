import type { StorageService } from '@/modules/storage/services/storage.service';

import { resolveBestEffortPresignedUrl } from './resolve-presigned-url';

describe('resolveBestEffortPresignedUrl', () => {
  it('retorna null sem key, sem tocar no storage', async () => {
    const getPresignedUrl = jest.fn();
    const storage = { getPresignedUrl } as unknown as StorageService;
    await expect(
      resolveBestEffortPresignedUrl(storage, null),
    ).resolves.toBeNull();
    expect(getPresignedUrl).not.toHaveBeenCalled();
  });

  it('retorna a presigned URL da key', async () => {
    const storage = {
      getPresignedUrl: jest.fn().mockResolvedValue('https://minio/signed'),
    } as unknown as StorageService;
    await expect(
      resolveBestEffortPresignedUrl(storage, 'groups/g/images/x.png'),
    ).resolves.toBe('https://minio/signed');
  });

  it('best-effort: retorna null se a assinatura falha (não propaga)', async () => {
    const storage = {
      getPresignedUrl: jest.fn().mockRejectedValue(new Error('minio down')),
    } as unknown as StorageService;
    await expect(
      resolveBestEffortPresignedUrl(storage, 'groups/g/images/x.png'),
    ).resolves.toBeNull();
  });
});
