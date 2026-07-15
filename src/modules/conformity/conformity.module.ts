import { Module } from '@nestjs/common';

import { EmailModule } from '@/common/email/email.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { PostgresDirectoryAdapter } from './adapters/postgres-directory.adapter';
import { ConformityListener } from './listeners/conformity.listener';
import { NotificationListener } from './listeners/notification.listener';
import { DIRECTORY_PORT } from './ports/directory.port';
import { OperationalEventRepository } from './repositories/operational-event.repository';

/**
 * Módulo de conformidade (#248/#249/#252).
 *
 * Provê o {@link DirectoryPort} via token, vinculado ao
 * {@link PostgresDirectoryAdapter} (#475 — leitura do diretório migrada de
 * Firestore para Postgres), e exporta o token. Registra o
 * {@link ConformityListener} (#252), que reage a
 * `movement.created`/`movement.conformity_requested`, resolve a conformidade de
 * **pousos com aeródromo conhecido (AUTOMATIC ou MANUAL)** e regista
 * não-conformidades sem solicitação aprovada, e o {@link NotificationListener}
 * (#253), que notifica por e-mail os coordenadores/operadores do aeródromo (com
 * dedupe). Nenhum detalhe da fonte de dados é exposto — só o port.
 */
@Module({
  imports: [PrismaModule, EmailModule],
  providers: [
    {
      provide: DIRECTORY_PORT,
      useClass: PostgresDirectoryAdapter,
    },
    OperationalEventRepository,
    ConformityListener,
    NotificationListener,
  ],
  exports: [DIRECTORY_PORT],
})
export class ConformityModule {}
