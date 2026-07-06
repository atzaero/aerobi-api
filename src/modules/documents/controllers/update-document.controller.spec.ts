import { buildMockRequest } from '@/common/testing/http-request.mock';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { DocumentParamDTO } from '../dtos/document-param.dto';
import { DocumentResponseDTO } from '../dtos/document-response.dto';
import type { UpdateDocumentService } from '../services/update-document.service';

import { UpdateDocumentController } from './update-document.controller';

describe('UpdateDocumentController', () => {
  let controller: UpdateDocumentController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'coord-1',
    email: 'c@c.com',
    role: UserRole.COORDINATOR,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateDocumentController({
      execute,
    } as unknown as UpdateDocumentService);
  });

  it('delega id/dto/ator + contexto de auditoria', async () => {
    const params: DocumentParamDTO = {
      id: '11111111-1111-4111-8111-111111111111',
    };
    const dto = { originalFilename: 'novo.pdf' };
    const request = buildMockRequest({ userAgent: 'jest' });
    const row = new DocumentResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, dto, actor, request)).resolves.toBe(
      row,
    );
    expect(execute).toHaveBeenCalledWith(
      params.id,
      dto,
      actor,
      expect.objectContaining({ actorId: actor.id }),
    );
  });
});
