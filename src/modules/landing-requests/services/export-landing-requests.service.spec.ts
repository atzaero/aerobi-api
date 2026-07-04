import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { EXPORT_MAX_ROWS } from '@/common/utils/csv.util';
import { LandingRequestStatus, UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { LandingRequestRepository } from '../repositories/landing-request.repository';
import { buildLandingRequestFixture } from '../testing/landing-request.entity.fixture';
import { ExportLandingRequestsService } from './export-landing-requests.service';

const admin: AuthenticatedUser = {
  id: 'admin-1',
  email: 'a@a.com',
  role: UserRole.ADMIN,
};

describe('ExportLandingRequestsService', () => {
  let service: ExportLandingRequestsService;
  let findMany: jest.Mock;
  let count: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn().mockResolvedValue([]);
    count = jest.fn();
    service = new ExportLandingRequestsService(
      { findMany, count } as unknown as LandingRequestRepository,
      { findActiveById: jest.fn() } as unknown as UserRepository,
      new ErrorMessageService(),
    );
  });

  it('gera CSV com as 8 colunas do web e sem CPF', async () => {
    findMany.mockResolvedValue([
      buildLandingRequestFixture({
        status: LandingRequestStatus.APPROVED,
        pilotName: 'João',
        aircraftModel: 'Cessna 172',
        aircraftRegistration: 'PT-ABC',
        phoneContact: '+5511999999999',
        email: 'p@e.com',
        pilotCpf: '12345678909',
      }),
    ]);
    const { csv, truncated } = await service.execute({}, admin);
    expect(csv).toContain('Aeródromo (ID)');
    expect(csv).toContain('Aprovada');
    expect(csv).toContain('João');
    expect(csv.toLowerCase()).not.toContain('cpf');
    expect(csv).not.toContain('12345678909');
    expect(truncated).toBe(false);
  });

  it('sinaliza truncamento acima do teto', async () => {
    findMany.mockResolvedValue(
      Array.from({ length: EXPORT_MAX_ROWS + 1 }, () =>
        buildLandingRequestFixture(),
      ),
    );
    count.mockResolvedValue(EXPORT_MAX_ROWS + 1);
    const { truncated, total } = await service.execute({}, admin);
    expect(truncated).toBe(true);
    expect(total).toBe(EXPORT_MAX_ROWS + 1);
  });
});
