import { Module } from '@nestjs/common';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateAerodromeGeojsonController } from './controllers/create-aerodrome-geojson.controller';
import { FindAerodromeGeojsonByIdController } from './controllers/find-aerodrome-geojson-by-id.controller';
import { ListAerodromeGeojsonsController } from './controllers/list-aerodrome-geojsons.controller';
import { RemoveAerodromeGeojsonController } from './controllers/remove-aerodrome-geojson.controller';
import { UpdateAerodromeGeojsonController } from './controllers/update-aerodrome-geojson.controller';

import { AerodromeGeojsonRepository } from './repositories/aerodrome-geojson.repository';

import { CreateAerodromeGeojsonService } from './services/create-aerodrome-geojson.service';
import { FindAerodromeGeojsonByIdService } from './services/find-aerodrome-geojson-by-id.service';
import { ListAerodromeGeojsonsService } from './services/list-aerodrome-geojsons.service';
import { RemoveAerodromeGeojsonService } from './services/remove-aerodrome-geojson.service';
import { UpdateAerodromeGeojsonService } from './services/update-aerodrome-geojson.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateAerodromeGeojsonController,
    UpdateAerodromeGeojsonController,
    ListAerodromeGeojsonsController,
    FindAerodromeGeojsonByIdController,
    RemoveAerodromeGeojsonController,
  ],
  providers: [
    AerobiApiKeyGuard,
    AerodromeGeojsonRepository,
    CreateAerodromeGeojsonService,
    UpdateAerodromeGeojsonService,
    ListAerodromeGeojsonsService,
    FindAerodromeGeojsonByIdService,
    RemoveAerodromeGeojsonService,
  ],
})
export class AerodromeGeojsonsModule {}
