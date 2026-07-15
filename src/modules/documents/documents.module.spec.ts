import { MODULE_METADATA } from '@nestjs/common/constants';

import { ExportDocumentsController } from './controllers/export-documents.controller';
import { FindDocumentByIdController } from './controllers/find-document-by-id.controller';
import { UploadAerodromeFileController } from './controllers/upload-aerodrome-file.controller';
import { DocumentsModule } from './documents.module';

/**
 * Em Express 5 (path-to-regexp 8) a precedência de `GET /documents/export` sobre
 * `/:id` depende da ordem de registro dos controllers. Trava a invariante: se o
 * `/:id` passar à frente, `export` cairia no handler de busca por id.
 */
describe('DocumentsModule — precedência de rotas fixas vs /:id', () => {
  const controllers = Reflect.getMetadata(
    MODULE_METADATA.CONTROLLERS,
    DocumentsModule,
  ) as unknown[];

  const findByIdIdx = controllers.indexOf(FindDocumentByIdController);

  it.each([
    ['export', ExportDocumentsController],
    ['aerodrome-file', UploadAerodromeFileController],
  ])('registra %s antes de FindDocumentByIdController', (_name, ctrl) => {
    const idx = controllers.indexOf(ctrl);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(findByIdIdx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(findByIdIdx);
  });
});
