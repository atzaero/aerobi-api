import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { FeedbackParamDTO } from '../dtos/feedback-param.dto';
import { FeedbackResponseDTO } from '../dtos/feedback-response.dto';
import type { RemoveFeedbackService } from '../services/remove-feedback.service';

import { RemoveFeedbackController } from './remove-feedback.controller';

describe('RemoveFeedbackController', () => {
  let controller: RemoveFeedbackController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'actor-9',
    email: 'a@a.com',
    role: UserRole.COORDINATOR,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveFeedbackController({
      execute,
    } as unknown as RemoveFeedbackService);
  });

  it('usa o id do param e o ator autenticado como deletedBy', async () => {
    const params: FeedbackParamDTO = {
      id: '55555555-5555-4555-8555-555555555555',
    };
    const row = new FeedbackResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, actor)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.id,
      deletedBy: actor.id,
    });
  });
});
