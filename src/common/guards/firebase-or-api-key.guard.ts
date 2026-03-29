import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { FirebaseAdminService } from '@/modules/auth/services/firebase-admin.service';

/**
 * Protege rotas consumidas pelo Next.js (Firebase ID token) ou operação manual (X-API-Key).
 * Evolução futura: JWT próprio via @nestjs/jwt sem misturar na mesma rota sem critério documentado.
 */
@Injectable()
export class FirebaseOrApiKeyGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly firebase: FirebaseAdminService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
        'Firebase Admin not configured; set FIREBASE_PROJECT_ID or use X-API-KEY when RAB_SYNC_API_KEY is set',
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
}
