import type { Response } from 'express';

import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { ExportUsersService } from '../services/export-users.service';

import { ExportUsersController } from './export-users.controller';

describe('ExportUsersController', () => {
  let controller: ExportUsersController;
  let execute: jest.Mock;
  let set: jest.Mock;
  let res: Response;

  const actor: AuthenticatedUser = {
    id: 'a',
    email: 'a@x',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    execute = jest.fn();
    set = jest.fn();
    res = { set } as unknown as Response;
    controller = new ExportUsersController({
      execute,
    } as unknown as ExportUsersService);
  });

  it('não truncado: seta Content-Type/Disposition e retorna o CSV', async () => {
    execute.mockResolvedValue({ csv: 'CSV', truncated: false, total: 1 });

    const out = await controller.handle({}, actor, res);

    expect(out).toBe('CSV');
    expect(execute).toHaveBeenCalledWith({}, actor);
    expect(set).toHaveBeenCalledWith({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="users.csv"',
    });
    expect(set).toHaveBeenCalledTimes(1);
  });

  it('truncado: adiciona X-Export-Truncated e X-Export-Total', async () => {
    execute.mockResolvedValue({ csv: 'CSV', truncated: true, total: 73000 });

    await controller.handle({}, actor, res);

    expect(set).toHaveBeenCalledWith({
      'X-Export-Truncated': 'true',
      'X-Export-Total': '73000',
    });
  });
});
