import { Module } from '@nestjs/common';

import { EmailModule } from '@/common/email/email.module';
import { FirestoreModule } from '@/common/firestore/firestore.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { FirestoreDirectoryAdapter } from './adapters/firestore-directory.adapter';
import { ConformityListener } from './listeners/conformity.listener';
import { NotificationListener } from './listeners/notification.listener';
import { FIRESTORE_DIRECTORY_PORT } from './ports/firestore-directory.port';
import { OperationalEventRepository } from './repositories/operational-event.repository';

/**
 * Módulo de conformidade (#248/#249/#252).
 *
 * Provê o {@link FirestoreDirectoryPort} via token, vinculado ao adapter
 * Firestore, e exporta o token. Registra o {@link ConformityListener} (#252),
 * que reage a `movement.created` e regista não-conformidades de pouso
 * automático sem solicitação aprovada, e o {@link NotificationListener}
 * (#253), que notifica por e-mail os coordenadores/operadores do aeródromo
 * (com dedupe). Nenhum detalhe do Firestore é exposto — só o port.
 */
@Module({
  imports: [FirestoreModule, PrismaModule, EmailModule],
  providers: [
    {
      provide: FIRESTORE_DIRECTORY_PORT,
      useClass: FirestoreDirectoryAdapter,
    },
    OperationalEventRepository,
    ConformityListener,
    NotificationListener,
  ],
  exports: [FIRESTORE_DIRECTORY_PORT],
})
export class ConformityModule {}
