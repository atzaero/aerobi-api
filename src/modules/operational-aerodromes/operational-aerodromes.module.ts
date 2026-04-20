import { Module } from '@nestjs/common';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateOperationalAerodromeController } from './controllers/create-operational-aerodrome.controller';
import { FindOperationalAerodromeByIdController } from './controllers/find-operational-aerodrome-by-id.controller';
import { ListOperationalAerodromesController } from './controllers/list-operational-aerodromes.controller';
import { RemoveOperationalAerodromeController } from './controllers/remove-operational-aerodrome.controller';
import { UpdateOperationalAerodromeController } from './controllers/update-operational-aerodrome.controller';

import { OperationalAerodromeRepository } from './repositories/operational-aerodrome.repository';

import { CreateOperationalAerodromeService } from './services/create-operational-aerodrome.service';
import { FindOperationalAerodromeByIdService } from './services/find-operational-aerodrome-by-id.service';
import { ListOperationalAerodromesService } from './services/list-operational-aerodromes.service';
import { RemoveOperationalAerodromeService } from './services/remove-operational-aerodrome.service';
import { UpdateOperationalAerodromeService } from './services/update-operational-aerodrome.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateOperationalAerodromeController,
    UpdateOperationalAerodromeController,
    ListOperationalAerodromesController,
    FindOperationalAerodromeByIdController,
    RemoveOperationalAerodromeController,
  ],
  providers: [
    AerobiApiKeyGuard,
    OperationalAerodromeRepository,
    CreateOperationalAerodromeService,
    UpdateOperationalAerodromeService,
    ListOperationalAerodromesService,
    FindOperationalAerodromeByIdService,
    RemoveOperationalAerodromeService,
  ],
})
export class OperationalAerodromesModule {}
