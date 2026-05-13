import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import {
  assertPasswordPolicy,
  comparePassword,
  hashPassword,
} from './password-hash.util';

const errorMessages = new ErrorMessageService();

describe('assertPasswordPolicy', () => {
  it('passa quando senha tem ≥8 chars + letras + números', () => {
    expect(() => assertPasswordPolicy('Senha123', errorMessages)).not.toThrow();
  });

  it('lança WEAK_PASSWORD quando senha tem menos de 8 chars', () => {
    try {
      assertPasswordPolicy('Abc123', errorMessages);
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.WEAK_PASSWORD,
      );
    }
  });

  it('lança WEAK_PASSWORD quando senha não tem letras', () => {
    try {
      assertPasswordPolicy('12345678', errorMessages);
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.WEAK_PASSWORD,
      );
    }
  });

  it('lança WEAK_PASSWORD quando senha não tem números', () => {
    try {
      assertPasswordPolicy('SemNumeros', errorMessages);
      fail('should have thrown');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.WEAK_PASSWORD,
      );
    }
  });
});

describe('hashPassword + comparePassword', () => {
  it('round-trip bcrypt funciona (compare retorna true para o plain correto)', async () => {
    const plain = 'MinhaSenha123';
    const hash = await hashPassword(plain);
    expect(hash).not.toBe(plain);
    expect(await comparePassword(plain, hash)).toBe(true);
  });

  it('compare retorna false para senha incorreta', async () => {
    const hash = await hashPassword('Correta123');
    expect(await comparePassword('Errada123', hash)).toBe(false);
  });
});
