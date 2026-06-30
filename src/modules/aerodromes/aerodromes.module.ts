import { Module } from '@nestjs/common';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateAerodromeController } from './controllers/create-aerodrome.controller';
import { FindAerodromeByIdController } from './controllers/find-aerodrome-by-id.controller';
import { ListAerodromesController } from './controllers/list-aerodromes.controller';
import { RemoveAerodromeController } from './controllers/remove-aerodrome.controller';
import { UpdateAerodromeController } from './controllers/update-aerodrome.controller';

import { AerodromeRepository } from './repositories/aerodrome.repository';

import { CreateAerodromeService } from './services/create-aerodrome.service';
import { FindAerodromeByIdService } from './services/find-aerodrome-by-id.service';
import { ListAerodromesService } from './services/list-aerodromes.service';
import { RemoveAerodromeService } from './services/remove-aerodrome.service';
import { UpdateAerodromeService } from './services/update-aerodrome.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateAerodromeController,
    UpdateAerodromeController,
    ListAerodromesController,
    FindAerodromeByIdController,
    RemoveAerodromeController,
  ],
  providers: [
    AerobiApiKeyGuard,
    AerodromeRepository,
    CreateAerodromeService,
    UpdateAerodromeService,
    ListAerodromesService,
    FindAerodromeByIdService,
    RemoveAerodromeService,
  ],
})
export class AerodromesModule {}
