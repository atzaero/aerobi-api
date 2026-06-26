import type { StorageService } from '@/modules/storage/services/storage.service';

import { buildAerodromeGroupFixture } from '../testing/aerodrome-group.entity.fixture';

import {
  toAerodromeGroupApiRowWithImage,
  toAerodromeGroupDeletionResultWithImage,
} from './aerodrome-group-response';

describe('aerodrome-group-response utils', () => {
  describe('toAerodromeGroupApiRowWithImage', () => {
    it('grupo sem imageKey → imageUrl null, sem tocar no storage', async () => {
      const getPresignedUrl = jest.fn();
      const storage = { getPresignedUrl } as unknown as StorageService;
      const entity = buildAerodromeGroupFixture({ imageKey: null });

      const out = await toAerodromeGroupApiRowWithImage(storage, entity);

      expect(out.imageUrl).toBeNull();
      expect(getPresignedUrl).not.toHaveBeenCalled();
    });

    it('grupo com imageKey → resolve a presigned URL', async () => {
      const getPresignedUrl = jest
        .fn()
        .mockResolvedValue('https://minio/signed');
      const storage = { getPresignedUrl } as unknown as StorageService;
      const entity = buildAerodromeGroupFixture({
        imageKey: 'groups/g/images/x.png',
      });

      const out = await toAerodromeGroupApiRowWithImage(storage, entity);

      expect(getPresignedUrl).toHaveBeenCalledWith('groups/g/images/x.png');
      expect(out.imageUrl).toBe('https://minio/signed');
    });
  });

  describe('toAerodromeGroupDeletionResultWithImage', () => {
    it('projeta affectedAerodromes junto da imagem resolvida', async () => {
      const storage = {
        getPresignedUrl: jest.fn().mockResolvedValue('https://minio/signed'),
      } as unknown as StorageService;
      const entity = buildAerodromeGroupFixture({
        imageKey: 'groups/g/images/x.png',
      });

      const out = await toAerodromeGroupDeletionResultWithImage(
        storage,
        entity,
        3,
      );

      expect(out.imageUrl).toBe('https://minio/signed');
      expect(out.affectedAerodromes).toBe(3);
    });
  });
});
