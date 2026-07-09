import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { AerodromeRepository } from '@/modules/aerodromes/repositories/aerodrome.repository';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { UserRepository } from '@/modules/users/repositories/user.repository';

import { GetDashboardQueryDTO } from '../dtos/get-dashboard-query.dto';
import { BuildAdminDashboardService } from './builders/build-admin-dashboard.service';
import { BuildOperatorDashboardService } from './builders/build-operator-dashboard.service';
import { BuildTechnicalDashboardService } from './builders/build-technical-dashboard.service';
import { GetDashboardService } from './get-dashboard.service';

const FROM = Date.UTC(2026, 0, 1);
const TO = Date.UTC(2026, 1, 1);

const query = (
  over: Partial<GetDashboardQueryDTO> = {},
): GetDashboardQueryDTO => Object.assign(new GetDashboardQueryDTO(), over);

const actor = (role: UserRole): AuthenticatedUser => ({
  id: 'actor-1',
  email: 'a@a.com',
  role,
});

/** Executa e devolve o `ErrorCode` da `CustomHttpException` lançada. */
async function expectErrorCode(promise: Promise<unknown>): Promise<ErrorCode> {
  try {
    await promise;
    throw new Error('esperava CustomHttpException');
  } catch (error) {
    expect(error).toBeInstanceOf(CustomHttpException);
    return (error as CustomHttpException).getErrorCode();
  }
}

describe('GetDashboardService', () => {
  let service: GetDashboardService;
  let userRepository: { findActiveById: jest.Mock };
  let aerodromeRepository: { findActiveIdsByGroup: jest.Mock };
  let adminBuild: jest.Mock;
  let operatorBuild: jest.Mock;
  let technicalBuild: jest.Mock;

  const ems = {
    getMessage: jest.fn(() => 'msg'),
  } as unknown as ErrorMessageService;

  beforeEach(() => {
    userRepository = { findActiveById: jest.fn() };
    aerodromeRepository = { findActiveIdsByGroup: jest.fn() };
    adminBuild = jest.fn().mockResolvedValue({ meta: { role: 'admin' } });
    operatorBuild = jest.fn().mockResolvedValue({ meta: { role: 'operator' } });
    technicalBuild = jest
      .fn()
      .mockResolvedValue({ meta: { role: 'technical' } });

    service = new GetDashboardService(
      userRepository as unknown as UserRepository,
      aerodromeRepository as unknown as AerodromeRepository,
      ems,
      { build: adminBuild } as unknown as BuildAdminDashboardService,
      { build: operatorBuild } as unknown as BuildOperatorDashboardService,
      { build: technicalBuild } as unknown as BuildTechnicalDashboardService,
    );
  });

  describe('dispatch por papel (ADMIN escopo all)', () => {
    it.each([
      [UserRole.ADMIN, () => adminBuild],
      [UserRole.COORDINATOR, () => adminBuild],
    ])('%s usa o builder admin', async (role, getBuilder) => {
      userRepository.findActiveById.mockResolvedValue({ groupId: 'g-1' });
      aerodromeRepository.findActiveIdsByGroup.mockResolvedValue(['a-1']);

      await service.execute(actor(role), query({ preset: '30d' }));

      expect(getBuilder()).toHaveBeenCalledTimes(1);
    });

    it('OPERATOR usa o builder operator', async () => {
      userRepository.findActiveById.mockResolvedValue({ groupId: 'g-1' });
      aerodromeRepository.findActiveIdsByGroup.mockResolvedValue(['a-1']);

      await service.execute(actor(UserRole.OPERATOR), query({ preset: '7d' }));

      expect(operatorBuild).toHaveBeenCalledTimes(1);
      expect(adminBuild).not.toHaveBeenCalled();
    });

    it('TECHNICAL usa o builder technical', async () => {
      userRepository.findActiveById.mockResolvedValue({ groupId: 'g-1' });
      aerodromeRepository.findActiveIdsByGroup.mockResolvedValue(['a-1']);

      await service.execute(actor(UserRole.TECHNICAL), query());

      expect(technicalBuild).toHaveBeenCalledTimes(1);
    });

    it('papel sem builder → FORBIDDEN (deny-by-default)', async () => {
      const code = await expectErrorCode(
        service.execute(actor('SUPPORT' as UserRole), query()),
      );

      expect(code).toBe(ErrorCode.FORBIDDEN);
      expect(adminBuild).not.toHaveBeenCalled();
    });
  });

  describe('escopo passado ao builder', () => {
    it('ADMIN → scope all (aerodromeIds null) e range custom resolvido', async () => {
      await service.execute(
        actor(UserRole.ADMIN),
        query({ preset: 'custom', from: FROM, to: TO }),
      );

      expect(adminBuild).toHaveBeenCalledWith({
        role: UserRole.ADMIN,
        scope: { scopeKind: 'all', aerodromeIds: null },
        range: { fromMs: FROM, toMs: TO, preset: 'custom' },
      });
      expect(userRepository.findActiveById).not.toHaveBeenCalled();
    });
  });

  describe('validação da faixa custom', () => {
    it.each([
      ['sem from/to', query({ preset: 'custom' })],
      ['from > to', query({ preset: 'custom', from: TO, to: FROM })],
    ])('%s → VALIDATION_FAILED', async (_label, q) => {
      const code = await expectErrorCode(
        service.execute(actor(UserRole.ADMIN), q),
      );
      expect(code).toBe(ErrorCode.VALIDATION_FAILED);
      expect(adminBuild).not.toHaveBeenCalled();
    });

    it('custom válido (from ≤ to) passa', async () => {
      await service.execute(
        actor(UserRole.ADMIN),
        query({ preset: 'custom', from: FROM, to: TO }),
      );
      expect(adminBuild).toHaveBeenCalledTimes(1);
    });
  });
});
