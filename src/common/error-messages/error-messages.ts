import { ErrorCode } from '@/common/enums/error-code.enum';

/**
 * Mapa central de mensagens humanas por `ErrorCode`.
 *
 * Placeholders usam a sintaxe `[CHAVE]` (em caixa alta) e são substituídos em
 * tempo de execução pelo `ErrorMessageService` com os parâmetros fornecidos.
 *
 * Mensagens em PT-BR — a Aerobi é um projeto brasileiro.
 */
export const messages: Record<ErrorCode, { message: string }> = {
  [ErrorCode.INTERNAL_ERROR]: {
    message: 'Erro interno do servidor. Tente novamente mais tarde.',
  },
  [ErrorCode.VALIDATION_FAILED]: {
    message: 'Falha de validação em um ou mais campos: [DETAILS].',
  },
  [ErrorCode.RESOURCE_NOT_FOUND]: {
    message: 'Recurso [RESOURCE] com identificador [ID] não encontrado.',
  },
  [ErrorCode.UNAUTHORIZED]: {
    message: 'Não autenticado. Credenciais ausentes ou inválidas.',
  },
  [ErrorCode.FORBIDDEN]: {
    message: 'Acesso negado ao recurso [RESOURCE].',
  },
  [ErrorCode.CONFLICT]: {
    message: 'Conflito ao processar a requisição: [DETAILS].',
  },
  [ErrorCode.EXTERNAL_SERVICE_FAILED]: {
    message:
      'Falha ao consumir o serviço externo [SERVICE]. Tente novamente mais tarde.',
  },
  [ErrorCode.DATABASE_ERROR]: {
    message: 'Erro ao acessar o banco de dados durante a operação [OPERATION].',
  },
  [ErrorCode.EMAIL_SEND_FAILED]: {
    message: 'Falha ao enviar email para [EMAIL]. Tente novamente mais tarde.',
  },
  [ErrorCode.ENCRYPTION_KEY_INVALID]: {
    message:
      'Chave de encriptação ausente ou inválida. Verifique a configuração do servidor.',
  },
  [ErrorCode.INVALID_TOKEN]: {
    message: 'Token inválido ou malformado.',
  },
  [ErrorCode.TOKEN_EXPIRED]: {
    message: 'Token expirado em [EXPIRED_AT].',
  },
  [ErrorCode.TOKEN_ALREADY_USED]: {
    message: 'Token já foi utilizado e não pode ser reaproveitado.',
  },
} as const;
