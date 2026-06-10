import { Module } from '@nestjs/common';

import { FirestoreModule } from '@/common/firestore/firestore.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { FirestoreDirectoryAdapter } from './adapters/firestore-directory.adapter';
import { ConformityListener } from './listeners/conformity.listener';
import { FIRESTORE_DIRECTORY_PORT } from './ports/firestore-directory.port';
import { OperationalEventRepository } from './repositories/operational-event.repository';

/**
 * Módulo de conformidade (#248/#249/#252).
 *
 * Provê o {@link FirestoreDirectoryPort} via token, vinculado ao adapter
 * Firestore, e exporta o token para consumidores futuros (#253). Registra o
 * {@link ConformityListener} (#252), que reage a `movement.created` e regista
 * não-conformidades de pouso automático sem solicitação aprovada. Nenhum
 * detalhe do Firestore é exposto — só o port.
 */
@Module({
  imports: [FirestoreModule, PrismaModule],
  providers: [
    {
      provide: FIRESTORE_DIRECTORY_PORT,
      useClass: FirestoreDirectoryAdapter,
    },
    OperationalEventRepository,
    ConformityListener,
  ],
  exports: [FIRESTORE_DIRECTORY_PORT],
})
export class ConformityModule {}
