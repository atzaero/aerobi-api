import { Module } from '@nestjs/common';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { PrismaModule } from '@/prisma/prisma.module';
import { StorageModule } from '@/modules/storage/storage.module';

import { BatchCreateAircraftReadingController } from './controllers/batch-create-aircraft-reading.controller';
import { CreateAircraftReadingController } from './controllers/create-aircraft-reading.controller';
import { FindAircraftReadingByIdController } from './controllers/find-aircraft-reading-by-id.controller';
import { ListAircraftReadingsController } from './controllers/list-aircraft-readings.controller';
import { RemoveAircraftReadingController } from './controllers/remove-aircraft-reading.controller';
import { AircraftReadingRepository } from './repositories/aircraft-reading.repository';
import { BatchCreateAircraftReadingService } from './services/batch-create-aircraft-reading.service';
import { CreateAircraftReadingService } from './services/create-aircraft-reading.service';
import { FindAircraftReadingByIdService } from './services/find-aircraft-reading-by-id.service';
import { ListAircraftReadingsService } from './services/list-aircraft-readings.service';
import { RemoveAircraftReadingService } from './services/remove-aircraft-reading.service';

/**
 * Módulo de leituras de matrícula (aircraft readings). Recebe as leituras do
 * pipeline aviascan-cv, persiste em Postgres e guarda as imagens no MinIO.
 */
@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [
    CreateAircraftReadingController,
    BatchCreateAircraftReadingController,
    ListAircraftReadingsController,
    FindAircraftReadingByIdController,
    RemoveAircraftReadingController,
  ],
  providers: [
    AerobiApiKeyGuard,
    AircraftReadingRepository,
    CreateAircraftReadingService,
    BatchCreateAircraftReadingService,
    ListAircraftReadingsService,
    FindAircraftReadingByIdService,
    RemoveAircraftReadingService,
  ],
})
export class ReadingsModule {}
