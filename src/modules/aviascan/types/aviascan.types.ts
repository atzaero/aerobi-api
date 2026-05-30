/**
 * Tipos partilhados do proxy AviaScan.
 * Referência: https://aviascanapi.lmpierin.com.br
 */

export type AviascanReadingsQuery = {
  readonly page?: number;
  readonly limit?: number;
  readonly registration?: string;
  readonly aerodrome?: string;
  readonly start_date?: string;
  readonly end_date?: string;
};

export type AviascanPaginationMeta = {
  readonly currentPage: number;
  readonly itemsPerPage: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
};

export type AviascanReading = {
  readonly id: number;
  readonly registration: string;
  readonly confidence: string;
  readonly reading_datetime: string;
  readonly reading_status: string | null;
  readonly revisor_id: number | null;
  readonly image_path: string | null;
  readonly comments: string | null;
  readonly aerodrome: string;
};

export type AviascanReadingsPaginatedResponse = {
  readonly data: AviascanReading[];
  readonly meta: AviascanPaginationMeta;
};
