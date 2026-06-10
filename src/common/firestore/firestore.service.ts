import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  type App,
  cert,
  getApp,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import { type Firestore, getFirestore } from 'firebase-admin/firestore';

/**
 * Encapsula a inicialização do Firebase Admin SDK e expõe a instância de
 * {@link Firestore}.
 *
 * A inicialização é **idempotente** (reaproveita `getApps()`) e **resiliente**:
 * se as credenciais (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`,
 * `FIREBASE_PRIVATE_KEY`) não estiverem presentes, o boot não é derrubado — só
 * é registado um aviso. O erro é levantado de forma clara apenas quando alguém
 * tentar de facto usar o Firestore (via {@link getFirestore}), permitindo que a
 * feature de conformidade fique desligada em dev sem credenciais.
 *
 * Espelha a estratégia de `aerobi-web` (`src/app/firebase/admin.ts`).
 */
@Injectable()
export class FirestoreService {
  private readonly logger = new Logger(FirestoreService.name);
  private readonly app: App | null;

  constructor(private readonly config: ConfigService) {
    this.app = this.initApp();
  }

  private initApp(): App | null {
    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.config.get<string>('FIREBASE_CLIENT_EMAIL');
    const rawKey = this.config.get<string>('FIREBASE_PRIVATE_KEY');
    const privateKey = rawKey?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn(
        'Firebase Admin não inicializado: faltam FIREBASE_PROJECT_ID, ' +
          'FIREBASE_CLIENT_EMAIL ou FIREBASE_PRIVATE_KEY. O Firestore só ' +
          'falhará quando for efetivamente utilizado.',
      );
      return null;
    }

    try {
      if (getApps().length > 0) {
        return getApp();
      }
      return initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    } catch (error) {
      this.logger.error(
        `Falha ao inicializar o Firebase Admin: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  /**
   * Devolve a instância de {@link Firestore}. Lança erro claro se o Admin SDK
   * não tiver sido inicializado (credenciais ausentes/ inválidas).
   */
  getFirestore(): Firestore {
    if (!this.app) {
      throw new Error(
        'Firestore indisponível: Firebase Admin não inicializado. Verifique ' +
          'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY.',
      );
    }
    return getFirestore(this.app);
  }
}
