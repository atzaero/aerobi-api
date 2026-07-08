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
- \`/aerodromes\`, \`/geojsons\`, \`/feedbacks\`
- \`/landing-requests\`, \`/technical-visits\`, \`/pilot-landings\`
- \`/aerodromes/{icao}/cameras\` e \`/streams/*\` (proxy HLS)

### 2. JWT Bearer (header Authorization)

Para rotas autenticadas por usuário humano. Envia
\`Authorization: Bearer <accessToken>\`, obtido via \`POST /auth/login\`. O
token é RS256 e expira em ~15min — use \`POST /auth/refresh\` para
rotacionar.

Aplica em:

- \`GET /auth/me\` e \`POST /auth/logout\`
- \`/users\` (CRUD) e \`/users/{id}/invite/resend\`
- \`/groups\` (CRUD) — admin cria, edita e remove; coordinator lê apenas o próprio grupo

### Rotas públicas

Sem autenticação: \`/health\`, \`/auth/login\`, \`/auth/refresh\`,
\`/users/invite/accept\` e \`/users/password-reset/*\`.

## Como autorizar nesta página

Clique em **Authorize** acima e preencha um ou ambos os campos:

- **api_key** — valor de \`AEROBI_API_KEY\`.
- **bearer** — apenas o JWT (sem o prefixo \`Bearer\`).
`.trim();

/**
 * Ordem lógica das seções (tags) no Swagger UI. O UI renderiza as tags na
 * ordem em que são declaradas aqui — sem esta declaração explícita elas
 * apareceriam na ordem arbitrária de descoberta dos controllers
 * (`app.module.ts`). Os blocos seguem o fluxo real de uso: autenticar →
 * montar a estrutura (grupo → aeródromo → recursos filhos) → operar →
 * integrações externas → sistema. O nome tem de bater exatamente com o
 * `@ApiTags(...)` de cada controller. Padrão canônico (blocos, nomenclatura,
 * decoradores por rota): ver `./README.md`.
 */
type SwaggerTag = readonly [name: string, description: string];

export const TAGS: readonly SwaggerTag[] = [
  /** Identidade & acesso */
  ['Auth', 'Login, refresh de sessão, perfil (`/auth/me`) e logout.'],
  [
    'Users',
    'Gestão de usuários (CRUD). ADMIN cria/remove e altera roles; COORDINATOR gere o próprio grupo.',
  ],
  ['Invites', 'Onboarding por convite: aceitar convite e reenviar.'],
  [
    'Password Reset',
    'Fluxo público de recuperação de senha: solicitar, validar token e confirmar.',
  ],

  /** Estrutura organizacional (cadeia de dependência) */
  [
    'Groups',
    'Grupos regionais — raiz da hierarquia. Crie o grupo antes de vincular aeródromos.',
  ],
  ['Aerodromes', 'Aeródromos operacionais, vinculados a um grupo.'],
  ['Cameras', 'Câmeras associadas a um aeródromo.'],
  ['Streams', 'Proxy HLS de transmissão ao vivo das câmeras.'],
  [
    'Camera Streams',
    'Proxy HLS v2 (lê os metadados de câmera do Postgres); sucede o Streams (Firestore).',
  ],
  ['Geojsons', 'Camadas GeoJSON (mapas) dos aeródromos.'],
  ['Documents', 'Documentos de aeródromo (KML, imagens, portarias, etc.).'],

  /** Operações & solicitações */
  [
    'Landing Requests',
    'Pedidos de aterragem: criação pública (X-API-Key) e decisão interna.',
  ],
  ['Pilot Landings', 'Registos de aterragem de pilotos.'],
  ['Technical Visits', 'Visitas técnicas aos aeródromos.'],
  [
    'Maintenances',
    'Intervenções de manutenção em aeródromos: CRUD, convites, export e stats.',
  ],
  ['Tasks', 'Tarefas de uma intervenção de manutenção.'],
  ['Guesses', 'Palpites das tarefas de manutenção: listagem e moderação.'],
  [
    'Public Maintenances',
    'Acesso público ao feedback de manutenção (gate por security_code + e-mail autorizado).',
  ],
  ['Movements', 'Movimentos: registos manuais e consulta canônica.'],
  [
    'Readings',
    'Ingestão de leituras/movimentos enviadas pelo edge (sensores).',
  ],
  ['Feedbacks', 'Feedbacks dos aeródromos: envio público e gestão interna.'],
  ['Contact', 'Formulário "Fale Conosco" e gestão dos contactos recebidos.'],

  /** Integrações externas (ANAC / DECEA / dados) */
  ['ANAC', 'Consulta de licença de piloto na ANAC.'],
  ['RAB', 'Registo Aeronáutico Brasileiro — histórico e sync (ANAC).'],
  ['Public Aerodromes', 'Aeródromos públicos — consulta e sync (ANAC).'],
  ['Private Aerodromes', 'Aeródromos privados — consulta e sync (ANAC).'],
  ['AISWEB', 'Proxy AISWEB/DECEA: NOTAM, ROTAER, SOL e INFOTEMP.'],
  ['Plugfield', 'Proxy Plugfield: dados meteorológicos e dispositivos.'],

  /** Sistema */
  ['Audit', 'Trilha de auditoria (append-only) das mutações do domínio.'],
  ['Health', 'Health check da API.'],
];

/** Documentação OpenAPI servida em `/api/docs` (JSON em `/api/docs-json`). */
export function setupSwagger(app: NestExpressApplication): void {
  const builder = new DocumentBuilder()
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
    });

  for (const [name, description] of TAGS) {
    builder.addTag(name, description);
  }

  const swaggerConfig = builder.build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
}
