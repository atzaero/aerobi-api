/**
 * Domínio de storage = a entidade/tabela **dona** do arquivo, que forma o 1º
 * segmento (topo) da key: `{domain}/{itemId}/{docType}/{leaf}`. O storage
 * espelha o banco — o topo é a tabela pela qual se consulta o item. Para
 * coleções (N arquivos por item, ex. imagens de visita técnica) o domínio é a
 * **entidade-raiz** (a visita), nunca a avó (o aeródromo).
 *
 * O valor é o slug usado no bucket (nome do módulo/rota na API, em inglês —
 * `technical-visits`, não `visitas`).
 */
export enum StorageDomain {
  USERS = 'users',
  GROUPS = 'groups',
  AERODROMES = 'aerodromes',
  TECHNICAL_VISITS = 'technical-visits',
  MOVEMENTS = 'movements',
  LANDINGS = 'landings',
}
