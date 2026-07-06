import { DocumentType } from '@/generated/prisma/client';

import {
  DOCUMENT_TYPE_API_VALUES,
  DOCUMENT_TYPE_LABELS,
  toDocumentTypeApi,
  toDocumentTypeEnum,
} from './document-type';

describe('document-type converters', () => {
  it('api → enum (só caixa)', () => {
    expect(toDocumentTypeEnum('image')).toBe(DocumentType.IMAGE);
    expect(toDocumentTypeEnum('plan_ordinance')).toBe(
      DocumentType.PLAN_ORDINANCE,
    );
  });

  it('enum → api (lowercase)', () => {
    expect(toDocumentTypeApi(DocumentType.KML)).toBe('kml');
    expect(toDocumentTypeApi(DocumentType.AERONAUTICAL_STUDY)).toBe(
      'aeronautical_study',
    );
  });

  it('round-trip para todos os valores da API', () => {
    for (const api of DOCUMENT_TYPE_API_VALUES) {
      expect(toDocumentTypeApi(toDocumentTypeEnum(api))).toBe(api);
    }
  });

  it('há um label pt-BR para cada tipo do enum', () => {
    for (const type of Object.values(DocumentType)) {
      expect(DOCUMENT_TYPE_LABELS[type]).toBeTruthy();
    }
  });
});
