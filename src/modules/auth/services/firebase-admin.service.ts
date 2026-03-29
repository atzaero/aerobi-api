import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

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

  isEnabled(): boolean {
    return admin.apps.length > 0;
  }

  async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    return admin.auth().verifyIdToken(token);
  }
}
