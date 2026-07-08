import { buildTechnicalVisitImageFixture } from '../testing/technical-visit-image.entity.fixture';
import type { TechnicalVisitImageRepository } from '../repositories/technical-visit-image.repository';
import type { StorageService } from '@/modules/storage/services/storage.service';

import { ListTechnicalVisitImagesService } from './list-technical-visit-images.service';

describe('ListTechnicalVisitImagesService', () => {
  it('lista imagens com imageUrl presigned', async () => {
    const images = [buildTechnicalVisitImageFixture()];
    const findByVisitId = jest.fn().mockResolvedValue(images);
    const service = new ListTechnicalVisitImagesService(
      { findByVisitId } as unknown as TechnicalVisitImageRepository,
      {
        getPresignedUrl: jest.fn().mockResolvedValue('https://signed'),
      } as unknown as StorageService,
    );

    const out = await service.execute('11111111-1111-4111-8111-111111111111');

    expect(findByVisitId).toHaveBeenCalled();
    expect(out).toHaveLength(1);
    expect(out[0].imageUrl).toBe('https://signed');
    expect(out[0]).not.toHaveProperty('imageKey');
  });
});
