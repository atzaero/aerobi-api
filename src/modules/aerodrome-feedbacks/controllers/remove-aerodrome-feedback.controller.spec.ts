import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { AerodromeFeedbackParamDTO } from '../dtos/aerodrome-feedback-param.dto';
import { AerodromeFeedbackResponseDTO } from '../dtos/aerodrome-feedback-response.dto';
import type { RemoveAerodromeFeedbackService } from '../services/remove-aerodrome-feedback.service';

import { RemoveAerodromeFeedbackController } from './remove-aerodrome-feedback.controller';

describe('RemoveAerodromeFeedbackController', () => {
  let controller: RemoveAerodromeFeedbackController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'actor-9',
    email: 'a@a.com',
    role: UserRole.COORDINATOR,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveAerodromeFeedbackController({
      execute,
    } as unknown as RemoveAerodromeFeedbackService);
  });

  it('usa o id do param e o ator autenticado como deletedBy', async () => {
    const params: AerodromeFeedbackParamDTO = {
      id: '55555555-5555-4555-8555-555555555555',
    };
    const row = new AerodromeFeedbackResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, actor)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.id,
      deletedBy: actor.id,
    });
  });
});
