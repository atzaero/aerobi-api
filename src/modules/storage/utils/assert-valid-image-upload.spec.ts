import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';

import { assertValidImageUpload } from './assert-valid-image-upload';

const ems = new ErrorMessageService();
const options = { maxBytes: 5 * 1024 * 1024 };

/** Magic bytes válidas de PNG (`89 50 4E 47 0D 0A 1A 0A`). */
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function file(
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File {
  return {
    fieldname: 'image',
    originalname: 'x.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 1024,
    buffer: PNG_MAGIC,
    ...overrides,
  } as Express.Multer.File;
}

/** Executa `fn`, esperando que lance, e devolve a exceção capturada. */
function capture(fn: () => void): CustomHttpException {
  try {
    fn();
  } catch (e) {
    return e as CustomHttpException;
  }
  throw new Error('esperava que lançasse VALIDATION_FAILED');
}

/** Mensagem interpolada exposta no payload da exceção. */
function detail(e: CustomHttpException): string {
  return (e.getResponse() as { message: string }).message;
}

describe('assertValidImageUpload', () => {
  it('passa para um upload de imagem válido', () => {
    expect(() => assertValidImageUpload(file(), ems, options)).not.toThrow();
  });

  it('imagem ausente → 400 VALIDATION_FAILED com detalhe interpolado', () => {
    const e = capture(() => assertValidImageUpload(undefined, ems, options));
    expect(e).toBeInstanceOf(CustomHttpException);
    expect(e.getErrorCode()).toBe(ErrorCode.VALIDATION_FAILED);
    expect(e.getStatus()).toBe(400);
    expect(detail(e)).toContain('a imagem é obrigatória');
    /** Guarda a regressão do #514: o [DETAILS] tem de ser substituído. */
    expect(detail(e)).not.toContain('[DETAILS]');
  });

  it('imagem vazia (0 bytes) → 400', () => {
    const e = capture(() =>
      assertValidImageUpload(file({ size: 0 }), ems, options),
    );
    expect(e.getErrorCode()).toBe(ErrorCode.VALIDATION_FAILED);
    expect(detail(e)).toContain('não pode estar vazia');
  });

  it('mimetype não permitido → 400', () => {
    const e = capture(() =>
      assertValidImageUpload(file({ mimetype: 'image/gif' }), ems, options),
    );
    expect(detail(e)).toContain('jpg, png ou webp');
  });

  it('excede o teto de bytes → 400 com o limite em MB', () => {
    const e = capture(() =>
      assertValidImageUpload(
        file({ size: options.maxBytes + 1 }),
        ems,
        options,
      ),
    );
    expect(detail(e)).toContain('excede o limite de 5 MB');
  });

  it('conteúdo divergente do mimetype declarado → 400 (magic bytes)', () => {
    const e = capture(() =>
      assertValidImageUpload(
        file({ mimetype: 'image/png', buffer: Buffer.from('not an image') }),
        ems,
        options,
      ),
    );
    expect(detail(e)).toContain('não corresponde');
  });

  it('respeita o teto configurável (10 MB não estoura o de 5 MB do chamador)', () => {
    const e = capture(() =>
      assertValidImageUpload(file({ size: 6 * 1024 * 1024 }), ems, {
        maxBytes: 5 * 1024 * 1024,
      }),
    );
    expect(detail(e)).toContain('excede o limite de 5 MB');
    expect(() =>
      assertValidImageUpload(file({ size: 6 * 1024 * 1024 }), ems, {
        maxBytes: 10 * 1024 * 1024,
      }),
    ).not.toThrow();
  });
});
