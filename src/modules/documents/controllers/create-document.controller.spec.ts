import { buildMockRequest } from '@/common/testing/http-request.mock';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { CreateDocumentDTO } from '../dtos/create-document.dto';
import { DocumentResponseDTO } from '../dtos/document-response.dto';
import type { CreateDocumentService } from '../services/create-document.service';

import { CreateDocumentController } from './create-document.controller';

describe('CreateDocumentController', () => {
  let controller: CreateDocumentController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'coord-1',
    email: 'c@c.com',
    role: UserRole.COORDINATOR,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreateDocumentController({
      execute,
    } as unknown as CreateDocumentService);
  });

  it('delega dto/file/ator + contexto de auditoria', async () => {
    const dto: CreateDocumentDTO = {
      aerodromeId: '22222222-2222-4222-8222-222222222222',
      type: 'extra',
    };
    const file = { originalname: 'x.pdf' } as Express.Multer.File;
    const request = buildMockRequest({ userAgent: 'jest' });
    const row = new DocumentResponseDTO();
    execute.mockResolvedValue(row);

    await expect(controller.handle(dto, file, actor, request)).resolves.toBe(
      row,
    );
    expect(execute).toHaveBeenCalledWith(
      dto,
      file,
      actor,
      expect.objectContaining({ actorId: actor.id }),
    );
  });
});
