import { DocumentType } from '@/generated/prisma/client';

import { hasKmlExtension, isAllowedAerodromeFile } from './aerodrome-file';

function file(
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'x.bin',
    encoding: '7bit',
    mimetype: 'application/octet-stream',
    size: 10,
    buffer: Buffer.from('x'),
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  } as Express.Multer.File;
}

describe('hasKmlExtension', () => {
  it('.kml/.kmz (case-insensitive)', () => {
    expect(hasKmlExtension('a.kml')).toBe(true);
    expect(hasKmlExtension('A.KMZ')).toBe(true);
    expect(hasKmlExtension('a.txt')).toBe(false);
  });
});

describe('isAllowedAerodromeFile', () => {
  it('IMAGE: só mimetypes de imagem', () => {
    expect(
      isAllowedAerodromeFile(
        DocumentType.IMAGE,
        file({ mimetype: 'image/png' }),
      ),
    ).toBe(true);
    expect(
      isAllowedAerodromeFile(
        DocumentType.IMAGE,
        file({ mimetype: 'text/plain' }),
      ),
    ).toBe(false);
  });

  it('KML: por MIME oficial OU extensão', () => {
    expect(
      isAllowedAerodromeFile(
        DocumentType.KML,
        file({ mimetype: 'application/vnd.google-earth.kml+xml' }),
      ),
    ).toBe(true);
    expect(
      isAllowedAerodromeFile(
        DocumentType.KML,
        file({
          mimetype: 'application/octet-stream',
          originalname: 'mapa.kmz',
        }),
      ),
    ).toBe(true);
    expect(
      isAllowedAerodromeFile(
        DocumentType.KML,
        file({
          mimetype: 'application/octet-stream',
          originalname: 'mapa.txt',
        }),
      ),
    ).toBe(false);
  });
});
