import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { ExportAerodromeGroupsQueryDTO } from '../dtos/export-aerodrome-groups-query.dto';
import type { ExportAerodromeGroupsService } from '../services/export-aerodrome-groups.service';

import { ExportAerodromeGroupsController } from './export-aerodrome-groups.controller';

const actor: AuthenticatedUser = {
  id: 'admin-1',
  email: 'a@e',
  role: UserRole.ADMIN,
};

describe('ExportAerodromeGroupsController', () => {
  let controller: ExportAerodromeGroupsController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ExportAerodromeGroupsController({
      execute,
    } as unknown as ExportAerodromeGroupsService);
  });

  it('delega query e ator ao service e devolve o CSV', async () => {
    const query: ExportAerodromeGroupsQueryDTO = { name: 'x' };
    execute.mockResolvedValue('\uFEFFID,Nome');
    await expect(controller.handle(query, actor)).resolves.toBe(
      '\uFEFFID,Nome',
    );
    expect(execute).toHaveBeenCalledWith(query, actor);
  });
});
