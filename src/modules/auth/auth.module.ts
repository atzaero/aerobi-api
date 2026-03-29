import { Global, Module } from '@nestjs/common';

import { FirebaseAdminService } from './services/firebase-admin.service';

/**
 * Módulo global auxiliar: expõe {@link FirebaseAdminService} para validação de Firebase ID tokens
 * no servidor (uso futuro ou integrações fora do módulo RAB).
 *
 * Rotas **`/rab/*`** usam **`RabApiKeyGuard`** (`X-API-Key` / `RAB_SYNC_API_KEY`), não este serviço.
 */
@Global()
@Module({
  providers: [FirebaseAdminService],
  exports: [FirebaseAdminService],
})
export class AuthModule {}
