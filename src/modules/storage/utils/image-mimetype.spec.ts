import {
  ALLOWED_IMAGE_MIMETYPES,
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
});
