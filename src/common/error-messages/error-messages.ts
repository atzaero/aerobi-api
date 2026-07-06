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

  // ---------------------------------------------------------------------------
  // Autenticação / usuários
  // ---------------------------------------------------------------------------
  [ErrorCode.USER_NOT_FOUND]: {
    message: 'Usuário [ID] não encontrado.',
  },
  [ErrorCode.EMAIL_ALREADY_REGISTERED]: {
    message: 'O email [EMAIL] já está registrado.',
  },
  [ErrorCode.INVALID_CREDENTIALS]: {
    message: 'Email ou senha inválidos.',
  },
  [ErrorCode.ACCOUNT_NOT_VERIFIED]: {
    message: 'Conta ainda não verificada. Confira seu email.',
  },
  [ErrorCode.ACCOUNT_NOT_ACTIVATED]: {
    message:
      'Conta ainda não ativada. Conclua o cadastro pelo link de convite enviado por email.',
  },
  [ErrorCode.ACCOUNT_DELETED]: {
    message: 'Esta conta foi removida e não pode ser usada.',
  },
  [ErrorCode.REFRESH_TOKEN_INVALID]: {
    message: 'Refresh token inválido. Faça login novamente.',
  },
  [ErrorCode.REFRESH_TOKEN_EXPIRED]: {
    message: 'Refresh token expirado. Faça login novamente.',
  },
  [ErrorCode.REFRESH_TOKEN_REVOKED]: {
    message: 'Refresh token revogado. Faça login novamente.',
  },
  [ErrorCode.REFRESH_TOKEN_REUSE_DETECTED]: {
    message:
      'Reuso de refresh token detectado. Por segurança, todas as sessões foram encerradas — faça login novamente.',
  },
  [ErrorCode.INVITE_TOKEN_INVALID]: {
    message: 'Link de convite inválido.',
  },
  [ErrorCode.INVITE_TOKEN_EXPIRED]: {
    message:
      'Link de convite expirado. Solicite ao administrador um novo convite.',
  },
  [ErrorCode.INVITE_ALREADY_ACCEPTED]: {
    message: 'Este convite já foi aceito anteriormente.',
  },
  [ErrorCode.PASSWORD_RESET_TOKEN_INVALID]: {
    message: 'Link de redefinição de senha inválido ou expirado.',
  },
  [ErrorCode.WEAK_PASSWORD]: {
    message:
      'A senha deve ter pelo menos 8 caracteres e conter letras e números.',
  },
  [ErrorCode.OWNERSHIP_VIOLATION]: {
    message: 'Você não tem permissão para acessar este recurso.',
  },
  [ErrorCode.ROLE_CHANGE_FORBIDDEN]: {
    message: 'Apenas administradores podem alterar a role de um usuário.',
  },

  // ---------------------------------------------------------------------------
  // Storage / object storage (MinIO/S3)
  // ---------------------------------------------------------------------------
  [ErrorCode.STORAGE_UPLOAD_FAILED]: {
    message: 'Falha ao enviar o arquivo para o armazenamento: [ERROR_MESSAGE].',
  },
  [ErrorCode.STORAGE_DELETE_FAILED]: {
    message: 'Falha ao remover o arquivo do armazenamento: [ERROR_MESSAGE].',
  },
  [ErrorCode.STORAGE_GET_PRESIGNED_URL_FAILED]: {
    message:
      'Falha ao gerar o link de acesso ao arquivo no armazenamento: [ERROR_MESSAGE].',
  },
  [ErrorCode.STORAGE_DOWNLOAD_FAILED]: {
    message: 'Falha ao baixar o arquivo do armazenamento: [ERROR_MESSAGE].',
  },

  // ---------------------------------------------------------------------------
  // Feedbacks de aeródromo
  // ---------------------------------------------------------------------------
  [ErrorCode.FEEDBACK_DAILY_LIMIT_REACHED]: {
    message: 'Já existe avaliação para esta sessão hoje.',
  },

  // ---------------------------------------------------------------------------
  // GeoJSON operacional
  // ---------------------------------------------------------------------------
  [ErrorCode.GEOJSON_NOT_READY]: {
    message: 'O GeoJSON do aeródromo [ID] não está pronto (status: [STATUS]).',
  },
  [ErrorCode.GEOJSON_READ_FAILED]: {
    message: 'O GeoJSON do aeródromo [ID] está indisponível ou é inválido.',
  },
} as const;
