import type { StorageService } from '@/modules/storage/services/storage.service';

import { buildGroupFixture } from '../testing/group.entity.fixture';

import {
  toGroupApiRowWithImage,
  toGroupDeletionResultWithImage,
} from './group-response';

describe('group-response utils', () => {
  describe('toGroupApiRowWithImage', () => {
    it('grupo sem imageKey → imageUrl null, sem tocar no storage', async () => {
      const getPresignedUrl = jest.fn();
      const storage = { getPresignedUrl } as unknown as StorageService;
      const entity = buildGroupFixture({ imageKey: null });

      const out = await toGroupApiRowWithImage(storage, entity);

      expect(out.imageUrl).toBeNull();
      expect(getPresignedUrl).not.toHaveBeenCalled();
    });

    it('grupo com imageKey → resolve a presigned URL', async () => {
      const getPresignedUrl = jest
        .fn()
        .mockResolvedValue('https://minio/signed');
      const storage = { getPresignedUrl } as unknown as StorageService;
      const entity = buildGroupFixture({
        imageKey: 'groups/g/images/x.png',
      });

      const out = await toGroupApiRowWithImage(storage, entity);

      expect(getPresignedUrl).toHaveBeenCalledWith('groups/g/images/x.png');
      expect(out.imageUrl).toBe('https://minio/signed');
    });
  });

  describe('toGroupDeletionResultWithImage', () => {
    it('projeta affectedAerodromes junto da imagem resolvida', async () => {
      const storage = {
        getPresignedUrl: jest.fn().mockResolvedValue('https://minio/signed'),
      } as unknown as StorageService;
      const entity = buildGroupFixture({
        imageKey: 'groups/g/images/x.png',
      });

      const out = await toGroupDeletionResultWithImage(storage, entity, 3);

      expect(out.imageUrl).toBe('https://minio/signed');
      expect(out.affectedAerodromes).toBe(3);
    });
  });
});
