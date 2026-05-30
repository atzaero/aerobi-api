import { resolveAviascanImageUrl } from './resolve-aviascan-image-url.util';

const BASE_URL = 'https://aviascanapi.lmpierin.com.br';

describe('resolveAviascanImageUrl', () => {
  it('prefixes the base URL to a relative path', () => {
    expect(resolveAviascanImageUrl('/uploads/abc.jpg', BASE_URL)).toBe(
      'https://aviascanapi.lmpierin.com.br/uploads/abc.jpg',
    );
  });

  it('adds a leading slash when the path has none', () => {
    expect(resolveAviascanImageUrl('uploads/abc.jpg', BASE_URL)).toBe(
      'https://aviascanapi.lmpierin.com.br/uploads/abc.jpg',
    );
  });

  it('returns absolute http(s) URLs unchanged', () => {
    expect(
      resolveAviascanImageUrl('https://cdn.example.com/x.jpg', BASE_URL),
    ).toBe('https://cdn.example.com/x.jpg');
  });

  it('returns null and undefined unchanged', () => {
    expect(resolveAviascanImageUrl(null, BASE_URL)).toBeNull();
    expect(resolveAviascanImageUrl(undefined, BASE_URL)).toBeUndefined();
  });

  it('returns empty string unchanged', () => {
    expect(resolveAviascanImageUrl('', BASE_URL)).toBe('');
  });
});
