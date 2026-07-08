import {
  UserRole,
  TechnicalVisitImageSection,
} from '@/generated/prisma/client';

import { buildAuthenticatedUserFixture } from '@/modules/auth/testing/authenticated-user.fixtures';

import { AddTechnicalVisitImageBodyDTO } from '../dtos/add-technical-visit-image-body.dto';
import { TechnicalVisitImageResponseDTO } from '../dtos/technical-visit-image-response.dto';
import { TechnicalVisitParamDTO } from '../dtos/technical-visit-param.dto';
import type { AddTechnicalVisitImageService } from '../services/add-technical-visit-image.service';

import { AddTechnicalVisitImageController } from './add-technical-visit-image.controller';

const actor = buildAuthenticatedUserFixture({
  id: '33333333-3333-4333-8333-333333333333',
  email: 'actor@test.com',
  role: UserRole.ADMIN,
});

const visitId = '11111111-1111-4111-8111-111111111111';

describe('AddTechnicalVisitImageController', () => {
  let controller: AddTechnicalVisitImageController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new AddTechnicalVisitImageController({
      execute,
    } as unknown as AddTechnicalVisitImageService);
  });

  it('delega upload com visita, seção, arquivo e ator', async () => {
    const params: TechnicalVisitParamDTO = { technicalVisitId: visitId };
    const body: AddTechnicalVisitImageBodyDTO = {
      section: TechnicalVisitImageSection.fence,
    };
    const file = { buffer: Buffer.from('x') } as Express.Multer.File;
    const row = new TechnicalVisitImageResponseDTO();
    execute.mockResolvedValue(row);

    await expect(controller.handle(params, body, file, actor)).resolves.toBe(
      row,
    );
    expect(execute).toHaveBeenCalledWith(visitId, body.section, file, actor);
  });
});
