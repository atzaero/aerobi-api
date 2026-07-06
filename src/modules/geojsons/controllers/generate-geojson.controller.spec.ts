import { ErrorCode } from '@/common/enums/error-code.enum';
import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { buildMockRequest } from '@/common/testing/http-request.mock';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import { GeojsonParamDTO } from '../dtos/geojson-param.dto';
import type { GenerateGeojsonService } from '../services/generate-geojson.service';
import { buildGeojsonFixture } from '../testing/geojson.entity.fixture';

import { GenerateGeojsonController } from './generate-geojson.controller';

const actor: AuthenticatedUser = {
  id: 'admin-1',
  email: 'a@a.com',
  role: UserRole.ADMIN,
};

const params: GeojsonParamDTO = {
  id: '22222222-2222-4222-8222-222222222222',
};

function buildFile(
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'mapa.kml',
    encoding: '7bit',
    mimetype: 'application/vnd.google-earth.kml+xml',
    size: 10,
    buffer: Buffer.from('<kml></kml>'),
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  } as Express.Multer.File;
}

describe('GenerateGeojsonController', () => {
  let controller: GenerateGeojsonController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new GenerateGeojsonController(
      { execute } as unknown as GenerateGeojsonService,
      new ErrorMessageService(),
    );
  });

  it('valida, delega e mapeia o registro gerado', async () => {
    const saved = buildGeojsonFixture({ aerodromeId: params.id });
    execute.mockResolvedValue({ status: 'READY', geojson: saved });
    const request = buildMockRequest({ userAgent: 'jest' });

    const out = await controller.handle(params, buildFile(), actor, request);

    expect(out.id).toBe(saved.id);
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ aerodromeId: params.id, actorId: actor.id }),
      expect.objectContaining({ actorId: actor.id }),
    );
  });

  it('arquivo ausente → 400 VALIDATION_FAILED', async () => {
    const request = buildMockRequest({ userAgent: 'jest' });
    try {
      await controller.handle(params, undefined, actor, request);
      throw new Error('expected');
    } catch (e) {
      expect(e).toBeInstanceOf(CustomHttpException);
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.VALIDATION_FAILED,
      );
    }
    expect(execute).not.toHaveBeenCalled();
  });

  it('extensão inválida → 400 VALIDATION_FAILED', async () => {
    const request = buildMockRequest({ userAgent: 'jest' });
    await expect(
      controller.handle(
        params,
        buildFile({ originalname: 'mapa.txt' }),
        actor,
        request,
      ),
    ).rejects.toBeInstanceOf(CustomHttpException);
    expect(execute).not.toHaveBeenCalled();
  });

  it('skip (aeródromo inexistente) → 404', async () => {
    execute.mockResolvedValue({ status: 'SKIPPED', geojson: null });
    const request = buildMockRequest({ userAgent: 'jest' });
    try {
      await controller.handle(params, buildFile(), actor, request);
      throw new Error('expected');
    } catch (e) {
      expect((e as CustomHttpException).getErrorCode()).toBe(
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }
  });
});
