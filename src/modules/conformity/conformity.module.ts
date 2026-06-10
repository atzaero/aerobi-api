import { Module } from '@nestjs/common';

import { FirestoreModule } from '@/common/firestore/firestore.module';

import { FirestoreDirectoryAdapter } from './adapters/firestore-directory.adapter';
import { FIRESTORE_DIRECTORY_PORT } from './ports/firestore-directory.port';

/**
 * Módulo de conformidade (#248/#249).
 *
 * Provê o {@link FirestoreDirectoryPort} via token, vinculado ao adapter
 * Firestore, e exporta o token para consumidores futuros (listeners #252/#253).
 * Nenhum detalhe do Firestore é exposto — só o port.
 */
@Module({
  imports: [FirestoreModule],
  providers: [
    {
      provide: FIRESTORE_DIRECTORY_PORT,
      useClass: FirestoreDirectoryAdapter,
    },
  ],
  exports: [FIRESTORE_DIRECTORY_PORT],
})
export class ConformityModule {}
