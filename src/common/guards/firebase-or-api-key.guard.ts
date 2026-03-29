import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { FirebaseAdminService } from '@/modules/auth/services/firebase-admin.service';

/**
 * Guard HTTP para rotas sensíveis (ex.: **`POST /rab/sync`**).
 *
 * ---
 *
 * ## O que o cliente envia (quando o guard **não** está em bypass)
 *
 * | Via | Header | Pré-requisito no servidor |
 * |-----|--------|---------------------------|
 * | **A — API key** | `X-API-Key: <segredo>` | `RAB_SYNC_API_KEY` definida e igual ao header |
 * | **B — Firebase** | `Authorization: Bearer <id_token>` | `FIREBASE_PROJECT_ID` + credenciais Admin SDK; token = `getIdToken()` no browser |
 *
 * O Bearer **não** é um JWT emitido por esta API Nest — é o **Firebase ID token** (JWT do Firebase Auth).
 *
 * ---
 *
 * ## Ordem de decisão em `canActivate` (resumo)
 *
 * 1. **Bypass em desenvolvimento** — ver secção abaixo; se aplicável → `true` sem validar headers.
 * 2. **API key** — se `RAB_SYNC_API_KEY` está definida **e** `X-API-Key` coincide → `true`.
 * 3. **Bearer** — extrai token, `FirebaseAdminService.verifyIdToken`, anexa `req.user` com o payload decodificado → `true`.
 * 4. Caso contrário → `401 UnauthorizedException` com mensagem alinhada à causa mais provável.
 *
 * ---
 *
 * ## Bypass em `development` (sem credenciais no Postman)
 *
 * - Se `NODE_ENV` (via `ConfigService`) é **`development`**, o guard **não exige** Bearer nem `X-API-Key`.
 * - **Objetivo:** desenvolvimento local rápido; **nunca** confiar nisto em produção — aí `NODE_ENV` deve ser `production` (ex. Dockerfile / compose prod).
 * - **Forçar auth mesmo em dev** (testes de integração, reproduzir 401): `RAB_SYNC_REQUIRE_AUTH=true` no `.env`.
 *
 * Valores considerados “truthy” para `RAB_SYNC_REQUIRE_AUTH`: `true`, `1`, `yes` (case-insensitive).
 *
 * ---
 *
 * ## Armadilhas a não esquecer
 *
 * - **`RAB_SYNC_API_KEY` vazia** — a via A fica desativada; só Firebase ou bypass dev.
 * - **Firebase sem init** — se não há `FIREBASE_PROJECT_ID` / credenciais inválidas, `FirebaseAdminService.isEnabled()` é `false`; na via B responde 401 a orientar API key ou config Firebase.
 * - **Bypass + `RAB_SYNC_API_KEY` em dev** — mesmo com chave definida, em `development` o pedido passa **sem** header; para testar a chave, usa `RAB_SYNC_REQUIRE_AUTH=true`.
 * - **Cron / jobs internos** — o scheduler que chama `RabSyncService.execute` **não** passa por este guard (é código servidor-a-servidor); só HTTP `POST /rab/sync` usa o guard.
 *
 * ---
 *
 * ## Registo NestJS
 *
 * - Declarar **`FirebaseOrApiKeyGuard`** em `providers` do módulo que expõe o controller (ex. `RabModule`), para injeção de `ConfigService` + `FirebaseAdminService`.
 * - Aplicar com `@UseGuards(FirebaseOrApiKeyGuard)` no método ou classe do controller.
 *
 * ---
 *
 * ## Ficheiros relacionados
 *
 * - `src/modules/auth/services/firebase-admin.service.ts` — init SDK + `verifyIdToken`
 * - `src/modules/auth/auth.module.ts` — `@Global()` exporta `FirebaseAdminService`
 * - `src/modules/rab/controllers/sync.controller.ts` — `@UseGuards(FirebaseOrApiKeyGuard)` em `POST /rab/sync`
 * - `src/modules/rab/rab.module.ts` — `providers: [FirebaseOrApiKeyGuard, ...]`
 * - `.env.example` — `NODE_ENV`, `RAB_SYNC_REQUIRE_AUTH`, `RAB_SYNC_API_KEY`, `FIREBASE_*`
 * - Opcional só Docker/watch (não afeta o guard): `CHOKIDAR_USEPOLLING`, `CHOKIDAR_INTERVAL` no `docker-compose.dev.yml` — mitigar `nest --watch` + bind mount
 *
 * Evolução futura: JWT próprio (`@nestjs/jwt`) em rotas separadas, documentado à parte, sem misturar com este fluxo.
 */
@Injectable()
export class FirebaseOrApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseOrApiKeyGuard.name);

  constructor(
    private readonly config: ConfigService,
    private readonly firebase: FirebaseAdminService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.shouldBypassAuth()) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();

    const expected = this.config.get<string>('RAB_SYNC_API_KEY');
    const apiKey = req.headers['x-api-key'];
    if (expected && typeof apiKey === 'string' && apiKey === expected) {
      return true;
    }

    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization');
    }
    const token = auth.slice(7).trim();
    if (!this.firebase.isEnabled()) {
      throw new UnauthorizedException(
        'Firebase Admin not configured; set FIREBASE_PROJECT_ID or use X-API-Key when RAB_SYNC_API_KEY is set',
      );
    }
    try {
      const decoded = await this.firebase.verifyIdToken(token);
      (req as Request & { user?: unknown }).user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid Firebase ID token');
    }
  }

  /**
   * `true` quando não devemos exigir credenciais no pedido HTTP.
   * Override explícito: `RAB_SYNC_REQUIRE_AUTH` truthy → **nunca** bypass por ambiente.
   */
  private shouldBypassAuth(): boolean {
    if (this.isRequireAuthEnforced()) {
      return false;
    }
    const nodeEnv = this.config.get<string>('NODE_ENV', 'development');
    const bypass = nodeEnv === 'development';
    if (bypass) {
      this.logger.debug(
        'Auth bypass: NODE_ENV=development (set RAB_SYNC_REQUIRE_AUTH=true to enforce FirebaseOrApiKey on this route)',
      );
    }
    return bypass;
  }

  private isRequireAuthEnforced(): boolean {
    const raw = this.config.get<string>('RAB_SYNC_REQUIRE_AUTH', '');
    const v = raw.trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'yes';
  }
}
