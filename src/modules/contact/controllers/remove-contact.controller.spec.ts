import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { ContactParamDTO } from '../dtos/update-contact-status.dto';
import type { RemoveContactService } from '../services/remove-contact.service';

import { RemoveContactController } from './remove-contact.controller';

describe('RemoveContactController', () => {
  let controller: RemoveContactController;
  let execute: jest.Mock;

  const actor: AuthenticatedUser = {
    id: 'admin-1',
    email: 'admin@x',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveContactController({
      execute,
    } as unknown as RemoveContactService);
  });

  it('delega id (do param) e actor ao service', async () => {
    const params: ContactParamDTO = { id: 'contact-1' };
    execute.mockResolvedValue({ id: 'contact-1' });

    await expect(controller.handle(params, actor)).resolves.toEqual({
      id: 'contact-1',
    });
    expect(execute).toHaveBeenCalledWith('contact-1', actor);
  });
});
