import type { Response } from 'express';

import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { ExportDocumentsService } from '../services/export-documents.service';

import { ExportDocumentsController } from './export-documents.controller';

describe('ExportDocumentsController', () => {
  let controller: ExportDocumentsController;
  let execute: jest.Mock;
  let headers: Record<string, string>;
  let res: Response;

  const actor: AuthenticatedUser = {
    id: 'a',
    email: 'a@x',
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    execute = jest.fn();
    headers = {};
    const set = jest.fn((h: Record<string, string>) => {
      Object.assign(headers, h);
    });
    res = { set } as unknown as Response;
    controller = new ExportDocumentsController({
      execute,
    } as unknown as ExportDocumentsService);
  });

  it('seta headers CSV com nome datado e retorna o CSV', async () => {
    execute.mockResolvedValue({ csv: 'CSV', truncated: false, total: 1 });
    const out = await controller.handle({}, actor, res);
    expect(out).toBe('CSV');
    expect(headers['Content-Type']).toBe('text/csv; charset=utf-8');
    expect(headers['Content-Disposition']).toContain(
      'attachment; filename="documentos-',
    );
  });

  it('propaga sinais de truncamento', async () => {
    execute.mockResolvedValue({ csv: 'CSV', truncated: true, total: 60000 });
    await controller.handle({}, actor, res);
    expect(headers['X-Export-Truncated']).toBe('true');
    expect(headers['X-Export-Total']).toBe('60000');
  });
});
