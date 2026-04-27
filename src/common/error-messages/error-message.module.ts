import { Global, Module } from '@nestjs/common';

import { ErrorMessageService } from '@/common/error-messages/error-message.service';

/**
 * Módulo global que disponibiliza o `ErrorMessageService` em toda a aplicação.
 *
 * Registrado uma única vez no `AppModule`; nenhum outro módulo precisa importar.
 */
@Global()
@Module({
  providers: [ErrorMessageService],
  exports: [ErrorMessageService],
})
export class ErrorMessageModule {}
