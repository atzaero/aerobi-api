import { Module } from '@nestjs/common';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateTechnicalVisitController } from './controllers/create-technical-visit.controller';
import { FindTechnicalVisitByIdController } from './controllers/find-technical-visit-by-id.controller';
import { ListTechnicalVisitsController } from './controllers/list-technical-visits.controller';
import { RemoveTechnicalVisitController } from './controllers/remove-technical-visit.controller';
import { UpdateTechnicalVisitController } from './controllers/update-technical-visit.controller';

import { TechnicalVisitRepository } from './repositories/technical-visit.repository';

import { CreateTechnicalVisitService } from './services/create-technical-visit.service';
import { FindTechnicalVisitByIdService } from './services/find-technical-visit-by-id.service';
import { ListTechnicalVisitsService } from './services/list-technical-visits.service';
import { RemoveTechnicalVisitService } from './services/remove-technical-visit.service';
import { UpdateTechnicalVisitService } from './services/update-technical-visit.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateTechnicalVisitController,
    UpdateTechnicalVisitController,
    ListTechnicalVisitsController,
    FindTechnicalVisitByIdController,
    RemoveTechnicalVisitController,
  ],
  providers: [
    AerobiApiKeyGuard,
    TechnicalVisitRepository,
    CreateTechnicalVisitService,
    UpdateTechnicalVisitService,
    ListTechnicalVisitsService,
    FindTechnicalVisitByIdService,
    RemoveTechnicalVisitService,
  ],
})
export class TechnicalVisitsModule {}
