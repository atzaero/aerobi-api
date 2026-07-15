import { buildMockRequest } from '@/common/testing/http-request.mock';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { DocumentParamDTO } from '../dtos/document-param.dto';
import { DocumentResponseDTO } from '../dtos/document-response.dto';
import type { RemoveDocumentService } from '../services/remove-document.service';

import { RemoveDocumentController } from './remove-document.controller';

describe('RemoveDocumentController', () => {
  let controller: RemoveDocumentController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'admin-1',
    email: 'a@a.com',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveDocumentController({
      execute,
    } as unknown as RemoveDocumentService);
  });

  it('delega id/ator + contexto de auditoria', async () => {
    const params: DocumentParamDTO = {
      id: '11111111-1111-4111-8111-111111111111',
    };
    const request = buildMockRequest({ userAgent: 'jest' });
    const row = new DocumentResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, actor, request)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(
      params.id,
      actor,
      expect.objectContaining({ actorId: actor.id }),
    );
  });
});
