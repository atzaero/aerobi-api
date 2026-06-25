import {
  ALLOWED_IMAGE_MIMETYPES,
  buildAerodromeGroupImageKey,
  isAllowedImageMimetype,
  MAX_GROUP_IMAGE_SIZE_BYTES,
} from './aerodrome-group-image';

describe('aerodrome-group-image utils', () => {
  it('aceita apenas jpg/png/webp', () => {
    expect(ALLOWED_IMAGE_MIMETYPES).toEqual([
      'image/jpeg',
      'image/png',
      'image/webp',
    ]);
    expect(isAllowedImageMimetype('image/jpeg')).toBe(true);
    expect(isAllowedImageMimetype('image/webp')).toBe(true);
    expect(isAllowedImageMimetype('image/gif')).toBe(false);
    expect(isAllowedImageMimetype('application/pdf')).toBe(false);
  });

  it('limite de 5 MB', () => {
    expect(MAX_GROUP_IMAGE_SIZE_BYTES).toBe(5 * 1024 * 1024);
  });

  it('monta a key no layout groups/{groupId}/images/<uuid>.<ext>', () => {
    expect(buildAerodromeGroupImageKey('grp-1', 'image/png')).toMatch(
      /^groups\/grp-1\/images\/[0-9a-f-]{36}\.png$/,
    );
    expect(buildAerodromeGroupImageKey('g', 'image/jpeg')).toMatch(/\.jpg$/);
    expect(buildAerodromeGroupImageKey('g', 'image/webp')).toMatch(/\.webp$/);
  });

  it('keys são únicas (uuid por chamada)', () => {
    const a = buildAerodromeGroupImageKey('g', 'image/png');
    const b = buildAerodromeGroupImageKey('g', 'image/png');
    expect(a).not.toBe(b);
  });
});
