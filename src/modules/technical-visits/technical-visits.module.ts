import { Module } from '@nestjs/common';

import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { StorageModule } from '@/modules/storage/storage.module';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { AddTechnicalVisitImageController } from './controllers/add-technical-visit-image.controller';
import { CreateTechnicalVisitController } from './controllers/create-technical-visit.controller';
import { ExportTechnicalVisitPdfController } from './controllers/export-technical-visit-pdf.controller';
import { FindTechnicalVisitByIdController } from './controllers/find-technical-visit-by-id.controller';
import { ListTechnicalVisitImagesController } from './controllers/list-technical-visit-images.controller';
import { ListTechnicalVisitsController } from './controllers/list-technical-visits.controller';
import { RemoveTechnicalVisitImageController } from './controllers/remove-technical-visit-image.controller';
import { RemoveTechnicalVisitController } from './controllers/remove-technical-visit.controller';
import { UpdateTechnicalVisitController } from './controllers/update-technical-visit.controller';

import { TechnicalVisitImageRepository } from './repositories/technical-visit-image.repository';
import { TechnicalVisitRepository } from './repositories/technical-visit.repository';

import { AddTechnicalVisitImageService } from './services/add-technical-visit-image.service';
import { CreateTechnicalVisitService } from './services/create-technical-visit.service';
import { ExportTechnicalVisitPdfService } from './services/export-technical-visit-pdf.service';
import { FindTechnicalVisitByIdService } from './services/find-technical-visit-by-id.service';
import { ListTechnicalVisitImagesService } from './services/list-technical-visit-images.service';
import { ListTechnicalVisitsService } from './services/list-technical-visits.service';
import { RemoveTechnicalVisitImageService } from './services/remove-technical-visit-image.service';
import { RemoveTechnicalVisitService } from './services/remove-technical-visit.service';
import { UpdateTechnicalVisitService } from './services/update-technical-visit.service';

/**
 * Módulo de visitas técnicas: CRUD + imagens por seção (MinIO) + export PDF,
 * sob autenticação JWT e escopo operacional por grupo (`JwtAuthGuard` +
 * `PermissionsGuard` + `GroupScopeGuard`). Importa `StorageModule` (imagens),
 * `AuditModule` (trilha de mutações) e `UsersModule` (resolução de modificadores).
 */
@Module({
  imports: [PrismaModule, AuthModule, UsersModule, StorageModule, AuditModule],
  controllers: [
    ListTechnicalVisitsController,
    CreateTechnicalVisitController,
    ExportTechnicalVisitPdfController,
    ListTechnicalVisitImagesController,
    AddTechnicalVisitImageController,
    FindTechnicalVisitByIdController,
    UpdateTechnicalVisitController,
    RemoveTechnicalVisitController,
    RemoveTechnicalVisitImageController,
  ],
  providers: [
    TechnicalVisitRepository,
    TechnicalVisitImageRepository,
    CreateTechnicalVisitService,
    UpdateTechnicalVisitService,
    ListTechnicalVisitsService,
    FindTechnicalVisitByIdService,
    RemoveTechnicalVisitService,
    AddTechnicalVisitImageService,
    ListTechnicalVisitImagesService,
    RemoveTechnicalVisitImageService,
    ExportTechnicalVisitPdfService,
  ],
})
export class TechnicalVisitsModule {}
