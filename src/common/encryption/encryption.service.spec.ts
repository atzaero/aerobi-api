import { ConfigService } from '@nestjs/config';

import { EncryptionService } from './encryption.service';

function mockConfig(values: Record<string, string | undefined>): ConfigService {
  return {
    get: (key: string, defaultValue?: string) =>
      (values[key] !== undefined ? values[key] : defaultValue) as string,
  } as ConfigService;
}

describe('EncryptionService', () => {
  // hex de 64 chars => 32 bytes (AES-256)
  const hexKey = 'a'.repeat(64);
  // string direta com exatamente 32 bytes
  const rawKey = 'b'.repeat(32);

  describe('constructor', () => {
    it('inicializa com chave hex de 64 caracteres', () => {
      expect(
        () => new EncryptionService(mockConfig({ ENCRYPTION_KEY: hexKey })),
      ).not.toThrow();
    });

    it('inicializa com chave string de 32 bytes', () => {
      expect(
        () => new EncryptionService(mockConfig({ ENCRYPTION_KEY: rawKey })),
      ).not.toThrow();
    });

    it('lança erro claro quando ENCRYPTION_KEY ausente', () => {
      expect(
        () => new EncryptionService(mockConfig({ ENCRYPTION_KEY: undefined })),
      ).toThrow(/ENCRYPTION_KEY_INVALID/);
    });

    it('lança erro claro quando chave tem tamanho inválido', () => {
      expect(
        () => new EncryptionService(mockConfig({ ENCRYPTION_KEY: 'short' })),
      ).toThrow(/ENCRYPTION_KEY_INVALID/);
    });

    it('lança erro claro quando hex tem 64 chars mas string tem tamanho distinto de 32 bytes', () => {
      // 64 chars, mas não é hex válido => cai no else e Buffer.from(...) tem 64 bytes
      const notHex64 = 'z'.repeat(64);
      expect(
        () => new EncryptionService(mockConfig({ ENCRYPTION_KEY: notHex64 })),
      ).toThrow(/ENCRYPTION_KEY_INVALID/);
    });
  });

  describe('encrypt/decrypt', () => {
    let service: EncryptionService;

    beforeEach(() => {
      service = new EncryptionService(mockConfig({ ENCRYPTION_KEY: hexKey }));
    });

    it('faz round-trip de string simples', () => {
      const encrypted = service.encrypt('hello');
      expect(encrypted).not.toBe('hello');
      expect(service.decrypt(encrypted)).toBe('hello');
    });

    it('produz IV distinto a cada chamada (ciphertexts diferentes para o mesmo input)', () => {
      const a = service.encrypt('same-input');
      const b = service.encrypt('same-input');
      expect(a).not.toBe(b);
      expect(service.decrypt(a)).toBe('same-input');
      expect(service.decrypt(b)).toBe('same-input');
    });

    it('cifra e decifra string vazia', () => {
      const encrypted = service.encrypt('');
      expect(service.decrypt(encrypted)).toBe('');
    });

    it('cifra e decifra texto unicode', () => {
      const value = 'Olá, 世界! 🔐 café ação';
      const encrypted = service.encrypt(value);
      expect(service.decrypt(encrypted)).toBe(value);
    });

    it('formato cifrado tem três partes em base64', () => {
      const encrypted = service.encrypt('payload');
      const parts = encrypted.split(':');
      expect(parts).toHaveLength(3);
      // IV tem 12 bytes => base64 de 16 chars com padding
      expect(Buffer.from(parts[0], 'base64')).toHaveLength(12);
      // authTag tem 16 bytes em GCM padrão
      expect(Buffer.from(parts[1], 'base64')).toHaveLength(16);
    });

    it('decrypt lança erro em formato inválido (partes insuficientes)', () => {
      expect(() => service.decrypt('not-a-valid-format')).toThrow(
        /Invalid encrypted value format/,
      );
    });

    it('decrypt lança erro quando valor vazio', () => {
      expect(() => service.decrypt('')).toThrow(/non-empty string/);
    });

    it('decrypt lança erro quando authTag adulterado', () => {
      const encrypted = service.encrypt('secret');
      const [iv, authTag, data] = encrypted.split(':');
      // Inverte um byte do authTag para invalidar a autenticação.
      const tampered = Buffer.from(authTag, 'base64');
      tampered[0] ^= 0xff;
      const bad = `${iv}:${tampered.toString('base64')}:${data}`;
      expect(() => service.decrypt(bad)).toThrow();
    });

    it('decrypt lança erro quando payload adulterado', () => {
      const encrypted = service.encrypt('secret');
      const [iv, authTag, data] = encrypted.split(':');
      const tampered = Buffer.from(data, 'base64');
      tampered[0] ^= 0xff;
      const bad = `${iv}:${authTag}:${tampered.toString('base64')}`;
      expect(() => service.decrypt(bad)).toThrow();
    });

    it('aceita chave string de 32 bytes e faz round-trip', () => {
      const svc = new EncryptionService(mockConfig({ ENCRYPTION_KEY: rawKey }));
      const encrypted = svc.encrypt('another-secret');
      expect(svc.decrypt(encrypted)).toBe('another-secret');
    });
  });
});
