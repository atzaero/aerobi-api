import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service responsável por criptografar e descriptografar valores usando AES-256-GCM.
 *
 * A chave é lida de `ENCRYPTION_KEY` via `ConfigService`. Aceita dois formatos:
 *  - hex de 64 caracteres (32 bytes após decodificação);
 *  - string direta com exatamente 32 bytes.
 *
 * O valor cifrado é retornado no formato `base64(iv):base64(authTag):base64(encrypted)`.
 *
 * @example
 * ```typescript
 * // Injetando o service:
 * constructor(private readonly encryptionService: EncryptionService) {}
 *
 * // Cifrar:
 * const encrypted = this.encryptionService.encrypt('12345678900');
 *
 * // Decifrar:
 * const decrypted = this.encryptionService.decrypt(encrypted);
 * ```
 */
@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly encryptionKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');

    if (!encryptionKey) {
      throw new Error(
        'ENCRYPTION_KEY_INVALID: variável de ambiente ENCRYPTION_KEY é obrigatória',
      );
    }

    // ENCRYPTION_KEY deve resultar em 32 bytes (256 bits) para AES-256.
    // Se for hex de 64 chars, decodifica; caso contrário, usa os bytes da string.
    if (encryptionKey.length === 64 && /^[0-9a-fA-F]+$/.test(encryptionKey)) {
      this.encryptionKey = Buffer.from(encryptionKey, 'hex');
    } else {
      this.encryptionKey = Buffer.from(encryptionKey);
    }

    if (this.encryptionKey.length !== 32) {
      throw new Error(
        'ENCRYPTION_KEY_INVALID: a chave deve ser hex de 64 chars (32 bytes) ou string de exatamente 32 bytes',
      );
    }

    this.logger.debug('EncryptionService initialized');
  }

  /**
   * Cifra um valor usando AES-256-GCM.
   *
   * @param value - Valor em texto claro a ser cifrado.
   * @returns Valor cifrado no formato `base64(iv):base64(authTag):base64(encrypted)`.
   * @throws Error se `value` não for uma string.
   */
  encrypt(value: string): string {
    if (typeof value !== 'string') {
      throw new Error('Value to encrypt must be a string');
    }

    // GCM requer IV de 12 bytes, gerado aleatoriamente por cifragem.
    const iv = randomBytes(12);

    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);

    let encrypted = cipher.update(value, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
  }

  /**
   * Decifra um valor previamente produzido por {@link EncryptionService.encrypt}.
   *
   * @param encryptedValue - Valor no formato `base64(iv):base64(authTag):base64(encrypted)`.
   * @returns Valor em texto claro.
   * @throws Error se o formato for inválido, a entrada não for string, ou o authTag
   *   não confira (a checagem é feita pelo módulo `crypto` nativo).
   */
  decrypt(encryptedValue: string): string {
    if (typeof encryptedValue !== 'string' || encryptedValue.length === 0) {
      throw new Error('Encrypted value must be a non-empty string');
    }

    const parts = encryptedValue.split(':');
    if (parts.length !== 3) {
      throw new Error(
        'Invalid encrypted value format. Expected format: iv:authTag:encryptedData',
      );
    }

    const [ivBase64, authTagBase64, encryptedData] = parts;

    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');

    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
