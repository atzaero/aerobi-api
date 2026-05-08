import { TokenGenerationService } from './token-generation.service';

describe('TokenGenerationService', () => {
  let service: TokenGenerationService;

  beforeEach(() => {
    service = new TokenGenerationService();
  });

  describe('generatePlainToken', () => {
    it('gera tokens base64url não vazios', () => {
      const token = service.generatePlainToken();
      expect(token).toBeTruthy();
      // base64url: alfanuméricos + '-' + '_' (sem '=' padding)
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('gera tokens diferentes em chamadas sucessivas', () => {
      const a = service.generatePlainToken();
      const b = service.generatePlainToken();
      expect(a).not.toEqual(b);
    });
  });

  describe('hashToken / compareToken', () => {
    it('compareToken retorna true para o plain original', async () => {
      const plain = service.generatePlainToken();
      const hash = await service.hashToken(plain);
      expect(hash).not.toEqual(plain);
      await expect(service.compareToken(plain, hash)).resolves.toBe(true);
    });

    it('compareToken retorna false se o plain for modificado', async () => {
      const plain = service.generatePlainToken();
      const hash = await service.hashToken(plain);
      await expect(service.compareToken(plain + 'x', hash)).resolves.toBe(
        false,
      );
    });
  });

  describe('computeExpiresAt', () => {
    it('retorna uma Date no futuro equivalente a now + minutes', () => {
      const before = Date.now();
      const d = service.computeExpiresAt(30);
      const after = Date.now();

      const min = before + 30 * 60_000;
      const max = after + 30 * 60_000;
      expect(d.getTime()).toBeGreaterThanOrEqual(min);
      expect(d.getTime()).toBeLessThanOrEqual(max);
    });
  });
});
