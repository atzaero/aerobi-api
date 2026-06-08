import { Module } from '@nestjs/common';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { PrismaModule } from '@/prisma/prisma.module';
import { StorageModule } from '@/modules/storage/storage.module';

import { CreateAircraftReadingController } from './controllers/create-aircraft-reading.controller';
import { AircraftReadingRepository } from './repositories/aircraft-reading.repository';
import { CreateAircraftReadingService } from './services/create-aircraft-reading.service';

/**
 * Módulo de leituras de matrícula (aircraft readings). Recebe as leituras do
 * pipeline aviascan-cv, persiste em Postgres e guarda as imagens no MinIO.
 */
@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [CreateAircraftReadingController],
  providers: [
    AerobiApiKeyGuard,
    AircraftReadingRepository,
    CreateAircraftReadingService,
  ],
})
export class ReadingsModule {}
