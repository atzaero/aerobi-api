import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Descrição em markdown — o Swagger UI renderiza listas, parágrafos e
 * inline code. **Evitar** combinar `**negrito**` com `` `code` `` no mesmo
 * token (o CSS padrão do swagger gera overlap vertical). Usar negrito em
 * texto comum e inline code separado.
 */
const DESCRIPTION = `
API NestJS da Aerobi: sincronização de dados ANAC (RAB, aeródromos públicos e privados),
proxies Plugfield e AISWEB/DECEA, consulta de licenças de piloto e gestão de aeródromos
operacionais.

## Autenticação

A API tem **dois esquemas independentes**.

### 1. API Key (header X-API-Key)

Para rotas operacionais e proxies. Envia o header com o valor de
\`AEROBI_API_KEY\`. Em desenvolvimento (\`NODE_ENV=development\`) há bypass —
ative \`AEROBI_REQUIRE_AUTH=true\` para forçar autenticação local.

Aplica em:

- \`/rab/*\`
- \`/private-aerodromes/*\` e \`/public-aerodromes/*\`
- \`/plugfield/*\`
- \`/aisweb/*\`
- \`/readings\`
- \`/anac/*\`
- \`/aerodrome-groups\`, \`/operational-aerodromes\`, \`/aerodrome-geojsons\`, \`/aerodrome-feedbacks\`
- \`/landing-requests\`, \`/technical-visits\`, \`/pilot-landings\`

### 2. JWT Bearer (header Authorization)

Para rotas autenticadas por usuário humano. Envia
\`Authorization: Bearer <accessToken>\`, obtido via \`POST /auth/login\`. O
token é RS256 e expira em ~15min — use \`POST /auth/refresh\` para
rotacionar.

Aplica em:

- \`GET /auth/me\` e \`POST /auth/logout\`
- \`/users\` (CRUD) e \`/users/{id}/invite/resend\`

### Rotas públicas

Sem autenticação: \`/health\`, \`/auth/login\`, \`/auth/refresh\`,
\`/users/invite/accept\` e \`/users/password-reset/*\`.

## Como autorizar nesta página

Clique em **Authorize** acima e preencha um ou ambos os campos:

- **api_key** — valor de \`AEROBI_API_KEY\`.
- **bearer** — apenas o JWT (sem o prefixo \`Bearer\`).
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
