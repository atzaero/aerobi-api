import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { DocumentType, UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { StorageService } from '@/modules/storage/services/storage.service';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { DocumentRepository } from '../repositories/document.repository';
import { buildDocumentFixture } from '../testing/document.entity.fixture';

import { ListDocumentsService } from './list-documents.service';

const admin: AuthenticatedUser = {
  id: 'admin-1',
  email: 'a@a.com',
  role: UserRole.ADMIN,
};
const operator: AuthenticatedUser = {
  id: 'op-1',
  email: 'o@o.com',
  role: UserRole.OPERATOR,
};

describe('ListDocumentsService', () => {
  let service: ListDocumentsService;
  let findMany: jest.Mock;
  let count: jest.Mock;
  let getPresignedUrl: jest.Mock;
  let findActiveById: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn().mockResolvedValue([]);
    count = jest.fn().mockResolvedValue(0);
    getPresignedUrl = jest.fn().mockResolvedValue('https://signed');
    findActiveById = jest.fn();
    service = new ListDocumentsService(
      { findMany, count } as unknown as DocumentRepository,
      { getPresignedUrl } as unknown as StorageService,
      { findActiveById } as unknown as UserRepository,
      new ErrorMessageService(),
    );
  });

  it('ADMIN: sem restrição; converte type api→enum e search', async () => {
    await service.execute({ type: 'kml', search: 'plano' }, admin);
    expect(findActiveById).not.toHaveBeenCalled();
    expect(findMany).toHaveBeenCalledWith(
      {
        type: DocumentType.KML,
        originalFilename: { contains: 'plano', mode: 'insensitive' },
      },
      0,
      10,
    );
  });

  it('OPERATOR com grupo: restringe via aerodrome.groupId', async () => {
    findActiveById.mockResolvedValue({ groupId: 'grp-9' });
    await service.execute({}, operator);
    expect(findMany).toHaveBeenCalledWith(
      { aerodrome: { groupId: 'grp-9' } },
      0,
      10,
    );
  });

  it('OPERATOR sem grupo: fail-closed', async () => {
    findActiveById.mockResolvedValue({ groupId: null });
    await service.execute({}, operator);
    expect(findMany).toHaveBeenCalledWith({ id: { in: [] } }, 0, 10);
  });

  it('resolve url presigned por linha', async () => {
    findMany.mockResolvedValue([buildDocumentFixture()]);
    count.mockResolvedValue(1);
    const out = await service.execute({}, admin);
    expect(out.data[0].url).toBe('https://signed');
  });
});
