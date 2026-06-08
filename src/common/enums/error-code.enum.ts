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

  // ---------------------------------------------------------------------------
  // Autenticação / usuários (módulo `auth` + `users`)
  // ---------------------------------------------------------------------------

  /** Usuário não encontrado pelo identificador informado. */
  USER_NOT_FOUND = 'USER_NOT_FOUND',

  /** Email já registrado por outro usuário (constraint única). */
  EMAIL_ALREADY_REGISTERED = 'EMAIL_ALREADY_REGISTERED',

  /** Credenciais inválidas no login (email/senha não conferem). */
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  /** Conta existe mas o email ainda não foi verificado. */
  ACCOUNT_NOT_VERIFIED = 'ACCOUNT_NOT_VERIFIED',

  /** Conta convidada mas ainda sem senha (convite não aceito). */
  ACCOUNT_NOT_ACTIVATED = 'ACCOUNT_NOT_ACTIVATED',

  /** Conta soft-deletada. */
  ACCOUNT_DELETED = 'ACCOUNT_DELETED',

  /** Refresh token malformado / não encontrado. */
  REFRESH_TOKEN_INVALID = 'REFRESH_TOKEN_INVALID',

  /** Refresh token expirado. */
  REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED',

  /** Refresh token já revogado. */
  REFRESH_TOKEN_REVOKED = 'REFRESH_TOKEN_REVOKED',

  /** Reuso de refresh token detectado — toda a família foi revogada. */
  REFRESH_TOKEN_REUSE_DETECTED = 'REFRESH_TOKEN_REUSE_DETECTED',

  /** Token de convite inválido ou não encontrado. */
  INVITE_TOKEN_INVALID = 'INVITE_TOKEN_INVALID',

  /** Token de convite expirado. */
  INVITE_TOKEN_EXPIRED = 'INVITE_TOKEN_EXPIRED',

  /** Convite já foi aceito anteriormente. */
  INVITE_ALREADY_ACCEPTED = 'INVITE_ALREADY_ACCEPTED',

  /** Token de redefinição de senha inválido. */
  PASSWORD_RESET_TOKEN_INVALID = 'PASSWORD_RESET_TOKEN_INVALID',

  /** Senha fornecida não atende à política mínima de força. */
  WEAK_PASSWORD = 'WEAK_PASSWORD',

  /** Usuário não é dono do recurso e não tem role suficiente. */
  OWNERSHIP_VIOLATION = 'OWNERSHIP_VIOLATION',

  /** Tentativa de alteração de role por usuário sem permissão. */
  ROLE_CHANGE_FORBIDDEN = 'ROLE_CHANGE_FORBIDDEN',

  // ---------------------------------------------------------------------------
  // Storage / object storage (módulo `storage` — MinIO/S3)
  // ---------------------------------------------------------------------------

  /** Falha ao enviar arquivo para o object storage (MinIO/S3). */
  STORAGE_UPLOAD_FAILED = 'STORAGE_UPLOAD_FAILED',

  /** Falha ao remover arquivo do object storage. */
  STORAGE_DELETE_FAILED = 'STORAGE_DELETE_FAILED',

  /** Falha ao gerar presigned URL do object storage. */
  STORAGE_GET_PRESIGNED_URL_FAILED = 'STORAGE_GET_PRESIGNED_URL_FAILED',

  /** Falha ao baixar objeto do object storage. */
  STORAGE_DOWNLOAD_FAILED = 'STORAGE_DOWNLOAD_FAILED',
}
