import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeFeedbacksPaginatedResponseDTO } from '../dtos/aerodrome-feedbacks-paginated-response.dto';
import type { ListAerodromeFeedbacksService } from '../services/list-aerodrome-feedbacks.service';

import { ListAerodromeFeedbacksController } from './list-aerodrome-feedbacks.controller';

describe('ListAerodromeFeedbacksController', () => {
  let controller: ListAerodromeFeedbacksController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'u1',
    email: 'u@u.com',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListAerodromeFeedbacksController({
      execute,
    } as unknown as ListAerodromeFeedbacksService);
  });

  it('delega query + ator', async () => {
    const q = { limit: 5 };
    const p = new AerodromeFeedbacksPaginatedResponseDTO([], 1, 5, 0);
    execute.mockResolvedValue(p);
    await expect(controller.handle(q, actor)).resolves.toBe(p);
    expect(execute).toHaveBeenCalledWith(q, actor);
  });
});
