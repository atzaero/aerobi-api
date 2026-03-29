import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

/**
 * Inicializa o Firebase Admin SDK no **servidor** para validar **Firebase ID tokens**
 * (JWT emitidos pelo Firebase Auth após login no cliente — ex.: `getIdToken()` no browser).
 *
 * ## Fluxo relacionado (quando a rota usa `FirebaseOrApiKeyGuard`)
 *
 * ```
 * Frontend (Firebase Auth) → ID token → Header Authorization: Bearer <token>
 *     → FirebaseOrApiKeyGuard → FirebaseAdminService.verifyIdToken() → rota (ex. POST /rab/sync)
 * ```
 *
 * Alternativa ao Bearer: header `X-API-Key` igual a `RAB_SYNC_API_KEY` (não passa por este serviço).
 *
 * Em `NODE_ENV=development` o guard pode fazer **bypass** sem chamar este serviço — ver JSDoc do guard.
 *
 * @see FirebaseOrApiKeyGuard em `src/common/guards/firebase-or-api-key.guard.ts`
 * @see AuthModule em `src/modules/auth/auth.module.ts`
 */
@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    if (admin.apps.length > 0) {
      return;
    }

    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
    if (!projectId) {
      this.logger.warn(
        'FIREBASE_PROJECT_ID not set; Firebase ID token verification disabled (use RAB_SYNC_API_KEY for manual sync).',
      );
      return;
    }

    const json = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON');
    try {
      if (json) {
        const cred = JSON.parse(json) as admin.ServiceAccount;
        admin.initializeApp({
          credential: admin.credential.cert(cred),
          projectId,
        });
      } else {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId,
        });
      }
      this.logger.log(`Firebase Admin initialized (project: ${projectId})`);
    } catch (e) {
      this.logger.error('Firebase Admin init failed', e);
    }
  }

  /** `true` se o Admin SDK foi inicializado (há projeto + credenciais válidas). */
  isEnabled(): boolean {
    return admin.apps.length > 0;
  }

  /**
   * Valida assinatura e expiração do ID token Firebase.
   * O token vem tipicamente de `user.getIdToken()` no cliente (mesmo projeto Firebase).
   */
  async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    return admin.auth().verifyIdToken(token);
  }
}
