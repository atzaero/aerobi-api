import { Global, Module } from '@nestjs/common';

import { FirestoreService } from './firestore.service';

/**
 * Módulo de infraestrutura que expõe a instância de Firestore (Firebase Admin).
 *
 * É `@Global` por conveniência (à semelhança do `PrismaModule`), mas o acesso
 * ao Firestore deve ficar isolado no adapter de cada domínio — consumidores de
 * negócio dependem do **port**, nunca diretamente do {@link FirestoreService}.
 */
@Global()
@Module({
  providers: [FirestoreService],
  exports: [FirestoreService],
})
export class FirestoreModule {}
