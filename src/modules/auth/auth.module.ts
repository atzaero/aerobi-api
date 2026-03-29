import { Global, Module } from '@nestjs/common';

import { FirebaseAdminService } from './services/firebase-admin.service';

/**
 * Módulo global de autenticação auxiliar: expõe {@link FirebaseAdminService} para validação
 * de Firebase ID tokens no servidor.
 *
 * O fluxo HTTP (Bearer, X-API-Key, bypass em `development`) está em
 * {@link FirebaseOrApiKeyGuard} (`src/common/guards/firebase-or-api-key.guard.ts`).
 */
@Global()
@Module({
  providers: [FirebaseAdminService],
  exports: [FirebaseAdminService],
})
export class AuthModule {}
