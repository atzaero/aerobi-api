/**
 * Fundação de construção de keys do storage. Fonte única da gramática
 * `{domain}/{itemId}/{docType}/{leaf}` (o storage espelha o banco). Módulos
 * consumidores importam daqui em vez de montar keys ad-hoc.
 */
export * from './storage-domain.enum';
export * from './storage-doc-type';
export * from './filename.util';
export * from './build-storage-key';
