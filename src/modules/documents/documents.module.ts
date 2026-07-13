import { Module } from '@nestjs/common';

import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { GeojsonsModule } from '@/modules/geojsons/geojsons.module';
import { StorageModule } from '@/modules/storage/storage.module';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { CreateDocumentController } from './controllers/create-document.controller';
import { ExportDocumentsController } from './controllers/export-documents.controller';
import { FindDocumentByIdController } from './controllers/find-document-by-id.controller';
import { ListDocumentsController } from './controllers/list-documents.controller';
import { RemoveDocumentController } from './controllers/remove-document.controller';
import { UpdateDocumentController } from './controllers/update-document.controller';
import { UploadAerodromeFileController } from './controllers/upload-aerodrome-file.controller';

import { DocumentRepository } from './repositories/document.repository';

import { AerodromeFileUrlsService } from './services/aerodrome-file-urls.service';
import { CreateDocumentService } from './services/create-document.service';
import { ExportDocumentsService } from './services/export-documents.service';
import { FindDocumentByIdService } from './services/find-document-by-id.service';
import { ListDocumentsService } from './services/list-documents.service';
import { RemoveDocumentService } from './services/remove-document.service';
import { UpdateDocumentService } from './services/update-document.service';
import { UploadAerodromeFileService } from './services/upload-aerodrome-file.service';

/**
 * Documentos de aeródromo (Firebase → API, #366). Arquivos no MinIO (domínio
 * `aerodromes`, key-only + presigned on-read); 7 endpoints com JWT +
 * `PermissionsGuard` (subject `document`; upload dedicado usa `aerodrome`) +
 * escopo por grupo. Importa `StorageModule` (upload/presigned), `AuthModule`/
 * `UsersModule` (guards + escopo), `AuditModule` (trilha) e `GeojsonsModule`
 * (geração de GeoJSON no upload de KML — #376).
 */
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    AuditModule,
    StorageModule,
    GeojsonsModule,
  ],
  controllers: [
    CreateDocumentController,
    ListDocumentsController,
    /**
     * `/export` e `/aerodrome-file` precedem `/:id` (Express 5 não tem regex no
     * param): senão `GET /documents/export` cairia no handler de busca por id. A
     * invariante é travada por `documents.module.spec.ts`.
     */
    ExportDocumentsController,
    UploadAerodromeFileController,
    FindDocumentByIdController,
    UpdateDocumentController,
    RemoveDocumentController,
  ],
  providers: [
    DocumentRepository,
    AerodromeFileUrlsService,
    CreateDocumentService,
    ListDocumentsService,
    ExportDocumentsService,
    UploadAerodromeFileService,
    FindDocumentByIdService,
    UpdateDocumentService,
    RemoveDocumentService,
  ],
  /**
   * Expõe `AerodromeFileUrlsService` para o `AerodromesModule` resolver
   * `imgUrl`/`kmlUrl` on-read no `GET /aerodromes/:id` (#550), sem desnormalizar
   * coluna nem acessar a tabela `documents` de fora deste módulo.
   */
  exports: [AerodromeFileUrlsService],
})
export class DocumentsModule {}
