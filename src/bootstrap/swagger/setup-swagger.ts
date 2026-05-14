import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Descrição em markdown — Swagger UI renderiza `**negrito**`, listas,
 * parágrafos e ``inline code``. Usar quebras de linha duplas (`\n\n`)
 * para parágrafos.
 */
const DESCRIPTION = `
API NestJS da Aerobi para sincronização do RAB (ANAC), aeródromos privados e públicos,
proxy Plugfield, integração AISWEB/DECEA e consulta de licenças de piloto.

## Autenticação

Existem **dois esquemas independentes**:

- **\`X-API-Key\`** (apiKey header): rotas operacionais e proxies.
  Em \`NODE_ENV=development\` há bypass — desativado se \`AEROBI_REQUIRE_AUTH=true\`.
  Aplica em: \`/rab/*\`, \`/private-aerodromes/*\`, \`/public-aerodromes/*\`,
  \`/plugfield/*\`, \`/aisweb/*\`, \`/anac/*\`, \`/aerodrome-*\`, \`/operational-aerodromes\`,
  \`/landing-requests\`, \`/technical-visits\`, \`/pilot-landings\`.

- **\`Authorization: Bearer <JWT>\`** (http bearer): rotas autenticadas por usuário.
  Obter o token via \`POST /auth/login\`. Aplica em: \`/auth/me\`, \`/auth/logout\`,
  \`/users\` (CRUD) e \`/users/{id}/invite/resend\`.

**Rotas públicas** (sem autenticação): \`/health\`, \`/auth/login\`, \`/auth/refresh\`,
\`/users/invite/accept\`, \`/users/password-reset/*\`.

## Como autorizar

Clique em **Authorize** acima e preencha **um** dos campos (ou ambos, se for testar rotas dos dois grupos):

- **api_key**: cole o valor de \`AEROBI_API_KEY\`.
- **bearer**: cole **apenas o JWT** (sem o prefixo \`Bearer\`).
`.trim();

/** Documentação OpenAPI servida em `/api/docs` (JSON em `/api/docs-json`). */
export function setupSwagger(app: NestExpressApplication): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Aerobi API')
    .setDescription(DESCRIPTION)
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' })
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        'JWT access token RS256 emitido por `POST /auth/login`. ' +
        'Expira em ~15min (configurável via `JWT_ACCESS_TTL`); ' +
        'use `POST /auth/refresh` para rotacionar.',
    })
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
}
