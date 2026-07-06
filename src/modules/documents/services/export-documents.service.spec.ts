import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { DocumentType, UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { StorageService } from '@/modules/storage/services/storage.service';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { DocumentRepository } from '../repositories/document.repository';
import { buildDocumentFixture } from '../testing/document.entity.fixture';

import { ExportDocumentsService } from './export-documents.service';

const admin: AuthenticatedUser = {
  id: 'admin-1',
  email: 'a@a.com',
  role: UserRole.ADMIN,
};

describe('ExportDocumentsService', () => {
  let service: ExportDocumentsService;
  let findAllForExport: jest.Mock;

  beforeEach(() => {
    findAllForExport = jest.fn().mockResolvedValue([
      buildDocumentFixture({
        type: DocumentType.KML,
        originalFilename: 'mapa.kml',
      }),
    ]);
    service = new ExportDocumentsService(
      { findAllForExport, count: jest.fn() } as unknown as DocumentRepository,
      {
        getPresignedUrl: jest.fn().mockResolvedValue('https://signed'),
      } as unknown as StorageService,
      { findActiveById: jest.fn() } as unknown as UserRepository,
      new ErrorMessageService(),
    );
  });

  it('gera CSV com as 6 colunas na ordem do web + URL presigned', async () => {
    const { csv, truncated, total } = await service.execute({}, admin);
    const header = csv.split('\r\n')[0].replace('﻿', '');
    expect(header).toBe(
      'Aeródromo (ID),Tipo,Arquivo,Tamanho (bytes),URL,Criado em (UTC)',
    );
    expect(csv).toContain('Plano Básico'); // label pt-BR do tipo KML
    expect(csv).toContain('https://signed');
    expect(truncated).toBe(false);
    expect(total).toBe(1);
  });
});
