import {
  buildAerodromeGroupImageKey,
  detectImageMimetype,
  MAX_GROUP_IMAGE_SIZE_BYTES,
} from './aerodrome-group-image';

describe('aerodrome-group-image utils', () => {
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

  describe('detectImageMimetype (magic bytes)', () => {
    it('detecta jpeg, png e webp pelas magic bytes', () => {
      expect(detectImageMimetype(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe(
        'image/jpeg',
      );
      expect(
        detectImageMimetype(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        ),
      ).toBe('image/png');
      expect(
        detectImageMimetype(
          Buffer.concat([
            Buffer.from('RIFF', 'ascii'),
            Buffer.from([0, 0, 0, 0]),
            Buffer.from('WEBP', 'ascii'),
          ]),
        ),
      ).toBe('image/webp');
    });

    it('detecta jpeg no limite inferior de 3 bytes (FF D8 FF)', () => {
      expect(detectImageMimetype(Buffer.from([0xff, 0xd8, 0xff]))).toBe(
        'image/jpeg',
      );
    });

    it('retorna null para bytes arbitrários, vazio ou undefined', () => {
      expect(detectImageMimetype(Buffer.from('not an image'))).toBeNull();
      expect(detectImageMimetype(Buffer.alloc(0))).toBeNull();
      expect(detectImageMimetype(undefined)).toBeNull();
    });

    it('não confunde RIFF não-WEBP (ex.: wav) com imagem', () => {
      const wav = Buffer.concat([
        Buffer.from('RIFF', 'ascii'),
        Buffer.from([0, 0, 0, 0]),
        Buffer.from('WAVE', 'ascii'),
      ]);
      expect(detectImageMimetype(wav)).toBeNull();
    });
  });
});
