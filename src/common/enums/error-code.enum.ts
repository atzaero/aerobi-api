/**
 * Códigos de erro padronizados da Aerobi API.
 *
 * Cada código identifica de forma estável uma categoria de falha, permitindo
 * que clientes (frontend, integrações) reajam programaticamente — sem depender
 * da mensagem humana (que pode mudar / ser traduzida).
 *
 * As mensagens correspondentes vivem em
 * `src/common/error-messages/error-messages.ts` e são resolvidas pelo
 * `ErrorMessageService`.
 */
export enum ErrorCode {
  /** Erro inesperado não mapeado (catch-all para 500). */
  INTERNAL_ERROR = 'INTERNAL_ERROR',

  /** Validação de DTO / parâmetros falhou (class-validator, pipes, etc). */
  VALIDATION_FAILED = 'VALIDATION_FAILED',

  /** Recurso solicitado não foi encontrado (404 genérico). */
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  /** Requisição sem autenticação ou com credenciais inválidas. */
  UNAUTHORIZED = 'UNAUTHORIZED',

  /** Autenticado, porém sem permissão para o recurso/ação. */
  FORBIDDEN = 'FORBIDDEN',

  /** Estado conflitante (duplicidade, unique constraint, etc). */
  CONFLICT = 'CONFLICT',

  /** Falha ao consumir serviço externo (API de terceiros). */
  EXTERNAL_SERVICE_FAILED = 'EXTERNAL_SERVICE_FAILED',

  /** Erro de banco de dados não previsto (Prisma, conexão, etc). */
  DATABASE_ERROR = 'DATABASE_ERROR',

  /** Falha ao enviar email. */
  EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED',

  /** Chave de encriptação ausente ou inválida. */
  ENCRYPTION_KEY_INVALID = 'ENCRYPTION_KEY_INVALID',

  /** Token malformado / assinatura inválida. */
  INVALID_TOKEN = 'INVALID_TOKEN',

  /** Token expirado. */
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  /** Token já utilizado (one-shot tokens, ex. verificação de email). */
  TOKEN_ALREADY_USED = 'TOKEN_ALREADY_USED',
}
