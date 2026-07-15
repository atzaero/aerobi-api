import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { DocumentsPaginatedResponseDTO } from '../dtos/documents-paginated-response.dto';
import type { ListDocumentsService } from '../services/list-documents.service';

import { ListDocumentsController } from './list-documents.controller';

describe('ListDocumentsController', () => {
  let controller: ListDocumentsController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'op-1',
    email: 'o@o.com',
    role: UserRole.OPERATOR,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListDocumentsController({
      execute,
    } as unknown as ListDocumentsService);
  });

  it('delega query + ator', async () => {
    const q = { limit: 10 };
    const p = new DocumentsPaginatedResponseDTO([], 1, 10, 0);
    execute.mockResolvedValue(p);
    await expect(controller.handle(q, actor)).resolves.toBe(p);
    expect(execute).toHaveBeenCalledWith(q, actor);
  });
});
