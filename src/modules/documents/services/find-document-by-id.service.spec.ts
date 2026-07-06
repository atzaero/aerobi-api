import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { StorageService } from '@/modules/storage/services/storage.service';

import type { DocumentRepository } from '../repositories/document.repository';
import { buildDocumentFixture } from '../testing/document.entity.fixture';

import { FindDocumentByIdService } from './find-document-by-id.service';

const id = '11111111-1111-4111-8111-111111111111';

describe('FindDocumentByIdService', () => {
  let service: FindDocumentByIdService;
  let findById: jest.Mock;
  let getPresignedUrl: jest.Mock;

  beforeEach(() => {
    findById = jest.fn();
    getPresignedUrl = jest.fn().mockResolvedValue('https://signed');
    service = new FindDocumentByIdService(
      { findById } as unknown as DocumentRepository,
      { getPresignedUrl } as unknown as StorageService,
      new ErrorMessageService(),
    );
  });

  it('sucesso com url presigned', async () => {
    findById.mockResolvedValue(buildDocumentFixture({ id }));
    const out = await service.execute({ id });
    expect(out.id).toBe(id);
    expect(out.url).toBe('https://signed');
  });

  it('inexistente → 404', async () => {
    findById.mockResolvedValue(null);
    await expect(service.execute({ id })).rejects.toBeInstanceOf(
      CustomHttpException,
    );
  });
});
