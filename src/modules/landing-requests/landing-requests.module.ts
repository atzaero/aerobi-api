import { Module } from '@nestjs/common';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateLandingRequestController } from './controllers/create-landing-request.controller';
import { FindLandingRequestByIdController } from './controllers/find-landing-request-by-id.controller';
import { ListLandingRequestsController } from './controllers/list-landing-requests.controller';
import { RemoveLandingRequestController } from './controllers/remove-landing-request.controller';
import { UpdateLandingRequestController } from './controllers/update-landing-request.controller';

import { LandingRequestRepository } from './repositories/landing-request.repository';

import { CreateLandingRequestService } from './services/create-landing-request.service';
import { FindLandingRequestByIdService } from './services/find-landing-request-by-id.service';
import { ListLandingRequestsService } from './services/list-landing-requests.service';
import { RemoveLandingRequestService } from './services/remove-landing-request.service';
import { UpdateLandingRequestService } from './services/update-landing-request.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateLandingRequestController,
    UpdateLandingRequestController,
    ListLandingRequestsController,
    FindLandingRequestByIdController,
    RemoveLandingRequestController,
  ],
  providers: [
    AerobiApiKeyGuard,
    LandingRequestRepository,
    CreateLandingRequestService,
    UpdateLandingRequestService,
    ListLandingRequestsService,
    FindLandingRequestByIdService,
    RemoveLandingRequestService,
  ],
})
export class LandingRequestsModule {}
