import { comparePassword, hashPassword } from './password-hash.util';

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
