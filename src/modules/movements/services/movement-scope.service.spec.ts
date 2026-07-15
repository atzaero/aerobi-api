import { UserRole } from '@/generated/prisma/client';
import type { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { AerodromeRepository } from '@/modules/aerodromes/repositories/aerodrome.repository';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import { MovementScopeService } from './movement-scope.service';

const admin: AuthenticatedUser = {
  id: 'a-1',
  email: 'a@e',
  role: UserRole.ADMIN,
};
const coordinator: AuthenticatedUser = {
  id: 'c-1',
  email: 'c@e',
  role: UserRole.COORDINATOR,
};

describe('MovementScopeService', () => {
  let service: MovementScopeService;
  let findActiveIcaosByGroup: jest.Mock;
  let findActiveById: jest.Mock;

  beforeEach(() => {
    findActiveIcaosByGroup = jest.fn();
    findActiveById = jest.fn();
    const aerodromeRepo = {
      findActiveIcaosByGroup,
    } as unknown as AerodromeRepository;
    const userRepository = { findActiveById } as unknown as UserRepository;
    const errors = {
      getMessage: jest.fn().mockReturnValue('não encontrado'),
    } as unknown as ErrorMessageService;
    service = new MovementScopeService(aerodromeRepo, userRepository, errors);
  });

  describe('resolveScopedIcaos', () => {
    it('ADMIN → null (sem restrição), sem tocar nos repositórios', async () => {
      const icaos = await service.resolveScopedIcaos(admin);
      expect(icaos).toBeNull();
      expect(findActiveById).not.toHaveBeenCalled();
      expect(findActiveIcaosByGroup).not.toHaveBeenCalled();
    });

    it('COORDINATOR com grupo → ICAOs do grupo', async () => {
      findActiveById.mockResolvedValue({ groupId: 'g-1' });
      findActiveIcaosByGroup.mockResolvedValue(['SSCF', 'SBSP']);

      const icaos = await service.resolveScopedIcaos(coordinator);

      expect(findActiveIcaosByGroup).toHaveBeenCalledWith('g-1');
      expect(icaos).toEqual(['SSCF', 'SBSP']);
    });

    it('COORDINATOR sem grupo → [] (fail-closed)', async () => {
      findActiveById.mockResolvedValue({ groupId: null });

      const icaos = await service.resolveScopedIcaos(coordinator);

      expect(icaos).toEqual([]);
      expect(findActiveIcaosByGroup).not.toHaveBeenCalled();
    });
  });

  describe('assertMovementInScope', () => {
    it('ADMIN passa direto', async () => {
      await expect(
        service.assertMovementInScope({ aerodrome: 'ZZZZ' }, 'm-1', admin),
      ).resolves.toBeUndefined();
    });

    it('COORDINATOR: ICAO no grupo passa', async () => {
      findActiveById.mockResolvedValue({ groupId: 'g-1' });
      findActiveIcaosByGroup.mockResolvedValue(['SSCF']);

      await expect(
        service.assertMovementInScope(
          { aerodrome: 'SSCF' },
          'm-1',
          coordinator,
        ),
      ).resolves.toBeUndefined();
    });

    it('COORDINATOR: ICAO fora do grupo → 404', async () => {
      findActiveById.mockResolvedValue({ groupId: 'g-1' });
      findActiveIcaosByGroup.mockResolvedValue(['SSCF']);

      await expect(
        service.assertMovementInScope(
          { aerodrome: 'SBGR' },
          'm-1',
          coordinator,
        ),
      ).rejects.toBeInstanceOf(CustomHttpException);
    });

    it('COORDINATOR: movimento sem ICAO (null) → 404', async () => {
      findActiveById.mockResolvedValue({ groupId: 'g-1' });
      findActiveIcaosByGroup.mockResolvedValue(['SSCF']);

      await expect(
        service.assertMovementInScope({ aerodrome: null }, 'm-1', coordinator),
      ).rejects.toBeInstanceOf(CustomHttpException);
    });
  });

  describe('assertIcaoInScope', () => {
    it('ADMIN cria para qualquer ICAO', async () => {
      await expect(
        service.assertIcaoInScope('ZZZZ', admin),
      ).resolves.toBeUndefined();
    });

    it('COORDINATOR: ICAO fora do grupo → 404', async () => {
      findActiveById.mockResolvedValue({ groupId: 'g-1' });
      findActiveIcaosByGroup.mockResolvedValue(['SSCF']);

      await expect(
        service.assertIcaoInScope('SBGR', coordinator),
      ).rejects.toBeInstanceOf(CustomHttpException);
    });
  });
});
