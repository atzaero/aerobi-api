import { DocumentType } from '@/generated/prisma/client';

/**
 * Valores do `type` no contrato da API (lowercase snake_case), por paridade com
 * o `aerobi-web` e com o `docType` do storage. O enum Prisma é persistido em
 * MAIÚSCULAS; a conversão é só de caixa (os valores coincidem 1:1).
 */
export const DOCUMENT_TYPE_API_VALUES = [
  'image',
  'kml',
  'plan_ordinance',
  'registration_ordinance',
  'grant_term',
  'aeronautical_study',
  'other_ordinance',
  'extra',
] as const;

export type DocumentTypeApi = (typeof DOCUMENT_TYPE_API_VALUES)[number];

/** `image` → `IMAGE`, `plan_ordinance` → `PLAN_ORDINANCE` (só caixa). */
export function toDocumentTypeEnum(api: DocumentTypeApi): DocumentType {
  return api.toUpperCase() as DocumentType;
}

/** `PLAN_ORDINANCE` → `plan_ordinance` (contrato de leitura + `docType` do storage). */
export function toDocumentTypeApi(type: DocumentType): DocumentTypeApi {
  return type.toLowerCase() as DocumentTypeApi;
}

/**
 * Rótulos pt-BR por tipo (export CSV) — espelham `DOCUMENT_TYPE_LABELS` do web
 * (`src/lib/document.ts`).
 */
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.IMAGE]: 'Designação de Cabeceira',
  [DocumentType.KML]: 'Plano Básico',
  [DocumentType.PLAN_ORDINANCE]: 'Portaria de Plano Básico',
  [DocumentType.REGISTRATION_ORDINANCE]: 'Portaria de Registro',
  [DocumentType.GRANT_TERM]: 'Termo de Outorga',
  [DocumentType.AERONAUTICAL_STUDY]: 'Estudo Aeronáutico',
  [DocumentType.OTHER_ORDINANCE]: 'Outras portarias',
  [DocumentType.EXTRA]: 'Documentos extras',
};
