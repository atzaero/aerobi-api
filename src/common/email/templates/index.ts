/**
 * Dicionário de templates HTML para emails enviados pelo EmailService.
 *
 * Placeholders usam o formato `[VARIABLE]` e são substituídos pelas chaves
 * do objeto `variables` passado em `EmailService.send()`.
 */
export const templates = {
  generic_notification: `
    <h1>[TITLE]</h1>
    <p>Olá [NAME],</p>
    <p>[MESSAGE]</p>
  `,
  invite: `
    <h1>Você foi convidado para a Aerobi</h1>
    <p>Olá [NAME],</p>
    <p>
      [INVITED_BY] convidou você para a Aerobi com a permissão
      <strong>[ROLE_LABEL]</strong>.
    </p>
    <p>
      Para concluir seu cadastro, defina sua senha clicando no link abaixo —
      ele expira em [EXPIRES_AT]:
    </p>
    <p><a href="[ACCEPT_URL]">Aceitar convite e definir senha</a></p>
    <p>
      Se você não esperava este email, pode ignorá-lo — o convite expirará
      automaticamente.
    </p>
  `,
  password_reset: `
    <h1>Redefinição de senha</h1>
    <p>Olá [NAME],</p>
    <p>
      Recebemos uma solicitação para redefinir sua senha na Aerobi. Para criar
      uma nova senha, clique no link abaixo — ele expira em [EXPIRES_AT]:
    </p>
    <p><a href="[RESET_URL]">Redefinir minha senha</a></p>
    <p>
      Solicitação originada do IP [IP_ADDRESS]. Se não foi você, ignore este
      email — sua senha atual continua válida.
    </p>
  `,
  email_changed: `
    <h1>Seu email de acesso foi alterado</h1>
    <p>Olá [NAME],</p>
    <p>
      O email da sua conta Aerobi foi alterado de <strong>[OLD_EMAIL]</strong>
      para <strong>[NEW_EMAIL]</strong> por um administrador.
    </p>
    <p>
      Por segurança, todas as sessões ativas foram encerradas — faça login
      novamente usando o novo email.
    </p>
    <p>
      Se você não reconhece esta alteração, contate o administrador da sua
      organização imediatamente.
    </p>
  `,
  landing_non_conformity: `
    <h1>Pouso sem solicitação de aterragem</h1>
    <p>
      Foi detectado um pouso da aeronave de matrícula
      <strong>[REGISTRATION]</strong> no aeródromo <strong>[AERODROME]</strong>
      em [OCCURRED_AT], sem uma solicitação de pouso correspondente registrada.
    </p>
    <p>
      Verifique a operação e tome as providências de conformidade cabíveis.
    </p>
  `,
} as const;

export type EmailTemplate = keyof typeof templates;
