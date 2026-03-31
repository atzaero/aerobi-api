/**
 * Pure helpers for offset pagination (page/limit/skip), aligned with
 * {@link BasePaginationQueryDTO} defaults.
 */

export type PaginationQueryInput = {
  page?: number;
  limit?: number;
};

export type ResolvedPaginationParams = {
  page: number;
  limit: number;
  skip: number;
};

export const PAGINATION_DEFAULT_PAGE = 1;

export const PAGINATION_DEFAULT_LIMIT = 10;

export const PAGINATION_MIN_LIMIT = 1;

export type ResolvePaginationParamsOptions = {
  /** Defaults to {@link PAGINATION_DEFAULT_PAGE}. */
  defaultPage?: number;
  /** Defaults to {@link PAGINATION_DEFAULT_LIMIT}. */
  defaultLimit?: number;
  /** Defaults to {@link PAGINATION_MIN_LIMIT}. */
  minLimit?: number;
};

/**
 * Resolves `page`, clamped `limit`, and `skip` for Prisma/SQL offset queries.
 *
 * @param input - Typically `page` / `limit` from a validated query DTO.
 * @param maxLimit - Upper bound for `limit` (e.g. 200 for RAB, 50 for other APIs).
 * @param options - Optional defaults when `page` / `limit` are omitted.
 */
export function resolvePaginationParams(
  input: PaginationQueryInput,
  maxLimit: number,
  options?: ResolvePaginationParamsOptions,
): ResolvedPaginationParams {
  const defaultPage = options?.defaultPage ?? PAGINATION_DEFAULT_PAGE;
  const defaultLimit = options?.defaultLimit ?? PAGINATION_DEFAULT_LIMIT;
  const minLimit = options?.minLimit ?? PAGINATION_MIN_LIMIT;

  const page = input.page ?? defaultPage;
  const rawLimit = input.limit ?? defaultLimit;
  const limit = Math.min(Math.max(rawLimit, minLimit), maxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
