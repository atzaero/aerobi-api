import type { Response } from 'express';

import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { ExportLandingRequestsQueryDTO } from '../dtos/export-landing-requests-query.dto';
import type { ExportLandingRequestsService } from '../services/export-landing-requests.service';
import { ExportLandingRequestsController } from './export-landing-requests.controller';

describe('ExportLandingRequestsController', () => {
  let controller: ExportLandingRequestsController;
  let execute: jest.Mock;
  let headers: Record<string, string>;
  let res: Response;

  const actor: AuthenticatedUser = {
    id: 'a',
    email: 'a@x',
    role: UserRole.ADMIN,
  };
  const query = {} as ExportLandingRequestsQueryDTO;

  beforeEach(() => {
    execute = jest.fn();
    headers = {};
    const set = (patch: Record<string, string>): void => {
      Object.assign(headers, patch);
    };
    res = { set } as unknown as Response;
    controller = new ExportLandingRequestsController({
      execute,
    } as unknown as ExportLandingRequestsService);
  });

  it('seta headers CSV com nome de arquivo datado e retorna o CSV', async () => {
    execute.mockResolvedValue({ csv: 'CSV', truncated: false, total: 1 });
    const out = await controller.handle(query, actor, res);
    expect(out).toBe('CSV');
    expect(headers['Content-Type']).toBe('text/csv; charset=utf-8');
    expect(headers['Content-Disposition']).toContain(
      'attachment; filename="solicitacoes-pouso-',
    );
  });

  it('truncado: adiciona X-Export-Truncated e X-Export-Total', async () => {
    execute.mockResolvedValue({ csv: 'CSV', truncated: true, total: 60000 });
    await controller.handle(query, actor, res);
    expect(headers['X-Export-Truncated']).toBe('true');
    expect(headers['X-Export-Total']).toBe('60000');
  });
});
