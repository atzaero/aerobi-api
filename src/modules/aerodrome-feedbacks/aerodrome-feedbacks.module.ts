import { Module } from '@nestjs/common';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateAerodromeFeedbackController } from './controllers/create-aerodrome-feedback.controller';
import { FindAerodromeFeedbackByIdController } from './controllers/find-aerodrome-feedback-by-id.controller';
import { ListAerodromeFeedbacksController } from './controllers/list-aerodrome-feedbacks.controller';
import { RemoveAerodromeFeedbackController } from './controllers/remove-aerodrome-feedback.controller';
import { UpdateAerodromeFeedbackController } from './controllers/update-aerodrome-feedback.controller';

import { AerodromeFeedbackRepository } from './repositories/aerodrome-feedback.repository';

import { CreateAerodromeFeedbackService } from './services/create-aerodrome-feedback.service';
import { FindAerodromeFeedbackByIdService } from './services/find-aerodrome-feedback-by-id.service';
import { ListAerodromeFeedbacksService } from './services/list-aerodrome-feedbacks.service';
import { RemoveAerodromeFeedbackService } from './services/remove-aerodrome-feedback.service';
import { UpdateAerodromeFeedbackService } from './services/update-aerodrome-feedback.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateAerodromeFeedbackController,
    UpdateAerodromeFeedbackController,
    ListAerodromeFeedbacksController,
    FindAerodromeFeedbackByIdController,
    RemoveAerodromeFeedbackController,
  ],
  providers: [
    AerobiApiKeyGuard,
    AerodromeFeedbackRepository,
    CreateAerodromeFeedbackService,
    UpdateAerodromeFeedbackService,
    ListAerodromeFeedbacksService,
    FindAerodromeFeedbackByIdService,
    RemoveAerodromeFeedbackService,
  ],
})
export class AerodromeFeedbacksModule {}
