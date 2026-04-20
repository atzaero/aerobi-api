import { Module } from '@nestjs/common';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreatePilotLandingController } from './controllers/create-pilot-landing.controller';
import { FindPilotLandingByIdController } from './controllers/find-pilot-landing-by-id.controller';
import { ListPilotLandingsController } from './controllers/list-pilot-landings.controller';
import { RemovePilotLandingController } from './controllers/remove-pilot-landing.controller';
import { UpdatePilotLandingController } from './controllers/update-pilot-landing.controller';

import { PilotLandingRepository } from './repositories/pilot-landing.repository';

import { CreatePilotLandingService } from './services/create-pilot-landing.service';
import { FindPilotLandingByIdService } from './services/find-pilot-landing-by-id.service';
import { ListPilotLandingsService } from './services/list-pilot-landings.service';
import { RemovePilotLandingService } from './services/remove-pilot-landing.service';
import { UpdatePilotLandingService } from './services/update-pilot-landing.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreatePilotLandingController,
    UpdatePilotLandingController,
    ListPilotLandingsController,
    FindPilotLandingByIdController,
    RemovePilotLandingController,
  ],
  providers: [
    AerobiApiKeyGuard,
    PilotLandingRepository,
    CreatePilotLandingService,
    UpdatePilotLandingService,
    ListPilotLandingsService,
    FindPilotLandingByIdService,
    RemovePilotLandingService,
  ],
})
export class PilotLandingsModule {}
