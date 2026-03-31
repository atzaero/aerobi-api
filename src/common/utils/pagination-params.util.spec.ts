import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  resolvePaginationParams,
} from './pagination-params.util';

describe('resolvePaginationParams', () => {
  it('uses defaults when page and limit are omitted', () => {
    const result = resolvePaginationParams({}, 200);
    expect(result).toEqual({
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
      skip: 0,
    });
  });

  it('computes skip for a later page', () => {
    expect(resolvePaginationParams({ page: 4, limit: 25 }, 200)).toEqual({
      page: 4,
      limit: 25,
      skip: 75,
    });
  });

  it('clamps limit to maxLimit', () => {
    expect(resolvePaginationParams({ page: 1, limit: 999 }, 200).limit).toBe(
      200,
    );
  });

  it('clamps limit up to minLimit when below', () => {
    expect(resolvePaginationParams({ page: 1, limit: 0 }, 200).limit).toBe(1);
  });

  it('respects custom defaults via options', () => {
    const result = resolvePaginationParams({}, 50, {
      defaultPage: 2,
      defaultLimit: 20,
    });
    expect(result).toEqual({ page: 2, limit: 20, skip: 20 });
  });
});
