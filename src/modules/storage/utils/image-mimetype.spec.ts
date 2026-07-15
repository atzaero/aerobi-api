import {
  ALLOWED_IMAGE_MIMETYPES,
  detectImageMimetype,
  isAllowedImageMimetype,
} from './image-mimetype';

describe('image-mimetype utils (storage)', () => {
  it('aceita apenas jpeg/png/webp', () => {
    expect(ALLOWED_IMAGE_MIMETYPES).toEqual([
      'image/jpeg',
      'image/png',
      'image/webp',
    ]);
  });

  it('isAllowedImageMimetype: aceita jpeg/webp e rejeita gif/pdf', () => {
    expect(isAllowedImageMimetype('image/jpeg')).toBe(true);
    expect(isAllowedImageMimetype('image/webp')).toBe(true);
    expect(isAllowedImageMimetype('image/gif')).toBe(false);
    expect(isAllowedImageMimetype('application/pdf')).toBe(false);
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
