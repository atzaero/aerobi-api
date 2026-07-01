import { Module } from '@nestjs/common';

import { AerobiApiKeyGuard } from '@/common/guards/aerobi-api-key.guard';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateGeojsonController } from './controllers/create-geojson.controller';
import { FindGeojsonByIdController } from './controllers/find-geojson-by-id.controller';
import { ListGeojsonsController } from './controllers/list-geojsons.controller';
import { RemoveGeojsonController } from './controllers/remove-geojson.controller';
import { UpdateGeojsonController } from './controllers/update-geojson.controller';

import { GeojsonRepository } from './repositories/geojson.repository';

import { CreateGeojsonService } from './services/create-geojson.service';
import { FindGeojsonByIdService } from './services/find-geojson-by-id.service';
import { ListGeojsonsService } from './services/list-geojsons.service';
import { RemoveGeojsonService } from './services/remove-geojson.service';
import { UpdateGeojsonService } from './services/update-geojson.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateGeojsonController,
    UpdateGeojsonController,
    ListGeojsonsController,
    FindGeojsonByIdController,
    RemoveGeojsonController,
  ],
  providers: [
    AerobiApiKeyGuard,
    GeojsonRepository,
    CreateGeojsonService,
    UpdateGeojsonService,
    ListGeojsonsService,
    FindGeojsonByIdService,
    RemoveGeojsonService,
  ],
})
export class GeojsonsModule {}
