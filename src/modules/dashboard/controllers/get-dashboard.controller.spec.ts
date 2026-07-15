import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { DashboardResponseDTO } from '../dtos/dashboard-response.dto';
import { GetDashboardQueryDTO } from '../dtos/get-dashboard-query.dto';
import { GetDashboardService } from '../services/get-dashboard.service';
import { GetDashboardController } from './get-dashboard.controller';

describe('GetDashboardController', () => {
  it('delega ao GetDashboardService com actor e query', async () => {
    const dto = { meta: { role: 'ADMIN' } } as unknown as DashboardResponseDTO;
    const execute = jest.fn().mockResolvedValue(dto);
    const controller = new GetDashboardController({
      execute,
    } as unknown as GetDashboardService);

    const actor: AuthenticatedUser = {
      id: 'actor-1',
      email: 'a@a.com',
      role: UserRole.ADMIN,
    };
    const query = Object.assign(new GetDashboardQueryDTO(), { preset: '30d' });

    await expect(controller.handle(actor, query)).resolves.toBe(dto);
    expect(execute).toHaveBeenCalledWith(actor, query);
  });
});
