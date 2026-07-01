import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import type { AerodromeRepository } from '../repositories/aerodrome.repository';

import {
  assertActiveGroup,
  rethrowAerodromeUniqueConflict,
} from './aerodrome-write.helpers';

describe('aerodrome-write.helpers', () => {
  const ems = new ErrorMessageService();

  describe('assertActiveGroup', () => {
    it('resolve quando o grupo existe e está ativo', async () => {
      const repo = {
        findActiveGroup: jest.fn().mockResolvedValue({ id: 'g' }),
      } as unknown as AerodromeRepository;
      await expect(assertActiveGroup(repo, ems, 'g')).resolves.toBeUndefined();
    });

    it('lança VALIDATION_FAILED quando o grupo é inexistente/removido', async () => {
      const repo = {
        findActiveGroup: jest.fn().mockResolvedValue(null),
      } as unknown as AerodromeRepository;
      try {
        await assertActiveGroup(repo, ems, 'g');
        throw new Error('expected');
      } catch (e) {
        expect((e as CustomHttpException).getErrorCode()).toBe(
          ErrorCode.VALIDATION_FAILED,
        );
      }
    });
  });

  describe('rethrowAerodromeUniqueConflict', () => {
    it('mapeia P2002 para CONFLICT', () => {
      try {
        rethrowAerodromeUniqueConflict({ code: 'P2002' }, ems, 'SBSP');
        throw new Error('expected');
      } catch (e) {
        expect((e as CustomHttpException).getErrorCode()).toBe(
          ErrorCode.CONFLICT,
        );
      }
    });

    it('relança qualquer outro erro intacto', () => {
      const other = new Error('boom');
      expect(() => rethrowAerodromeUniqueConflict(other, ems, 'SBSP')).toThrow(
        other,
      );
    });
  });
});
