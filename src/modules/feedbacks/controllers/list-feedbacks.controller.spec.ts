import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { FeedbacksPaginatedResponseDTO } from '../dtos/feedbacks-paginated-response.dto';
import type { ListFeedbacksService } from '../services/list-feedbacks.service';

import { ListFeedbacksController } from './list-feedbacks.controller';

describe('ListFeedbacksController', () => {
  let controller: ListFeedbacksController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'u1',
    email: 'u@u.com',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListFeedbacksController({
      execute,
    } as unknown as ListFeedbacksService);
  });

  it('delega query + ator', async () => {
    const q = { limit: 5 };
    const p = new FeedbacksPaginatedResponseDTO([], 1, 5, 0);
    execute.mockResolvedValue(p);
    await expect(controller.handle(q, actor)).resolves.toBe(p);
    expect(execute).toHaveBeenCalledWith(q, actor);
  });
});
