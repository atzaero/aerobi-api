import { ContactMessageStatus, UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type {
  ContactParamDTO,
  UpdateContactStatusDTO,
} from '../dtos/update-contact-status.dto';
import type { UpdateContactStatusService } from '../services/update-contact-status.service';

import { UpdateContactStatusController } from './update-contact-status.controller';

describe('UpdateContactStatusController', () => {
  let controller: UpdateContactStatusController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'admin-1',
    email: 'admin@x',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateContactStatusController({
      execute,
    } as unknown as UpdateContactStatusService);
  });

  it('delega id (do param), dto e actor ao service', async () => {
    const params: ContactParamDTO = { id: 'contact-1' };
    const dto: UpdateContactStatusDTO = {
      status: ContactMessageStatus.resolved,
    };
    execute.mockResolvedValue({ id: 'contact-1' });

    await expect(controller.handle(params, dto, actor)).resolves.toEqual({
      id: 'contact-1',
    });
    expect(execute).toHaveBeenCalledWith('contact-1', dto, actor);
  });
});
