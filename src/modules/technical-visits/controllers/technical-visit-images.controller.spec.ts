import {
  UserRole,
  TechnicalVisitImageSection,
} from '@/generated/prisma/client';

import { buildAuthenticatedUserFixture } from '@/modules/auth/testing/authenticated-user.fixtures';

import { AddTechnicalVisitImageBodyDTO } from '../dtos/add-technical-visit-image-body.dto';
import { TechnicalVisitImageParamDTO } from '../dtos/technical-visit-image-param.dto';
import { TechnicalVisitImageResponseDTO } from '../dtos/technical-visit-image-response.dto';
import { TechnicalVisitParamDTO } from '../dtos/technical-visit-param.dto';
import type { AddTechnicalVisitImageService } from '../services/add-technical-visit-image.service';
import type { ListTechnicalVisitImagesService } from '../services/list-technical-visit-images.service';
import type { RemoveTechnicalVisitImageService } from '../services/remove-technical-visit-image.service';

import {
  AddTechnicalVisitImageController,
  ListTechnicalVisitImagesController,
  RemoveTechnicalVisitImageController,
} from './technical-visit-images.controller';

const actor = buildAuthenticatedUserFixture({
  id: '33333333-3333-4333-8333-333333333333',
  email: 'actor@test.com',
  role: UserRole.ADMIN,
});

const visitId = '11111111-1111-4111-8111-111111111111';
const imageId = '99999999-9999-4999-8999-999999999999';

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

describe('ListTechnicalVisitImagesController', () => {
  let controller: ListTechnicalVisitImagesController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new ListTechnicalVisitImagesController({
      execute,
    } as unknown as ListTechnicalVisitImagesService);
  });

  it('delega listagem por visita', async () => {
    const params: TechnicalVisitParamDTO = { technicalVisitId: visitId };
    const rows = [new TechnicalVisitImageResponseDTO()];
    execute.mockResolvedValue(rows);

    await expect(controller.handle(params)).resolves.toBe(rows);
    expect(execute).toHaveBeenCalledWith(visitId);
  });
});

describe('RemoveTechnicalVisitImageController', () => {
  let controller: RemoveTechnicalVisitImageController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveTechnicalVisitImageController({
      execute,
    } as unknown as RemoveTechnicalVisitImageService);
  });

  it('delega remoção com ator e contexto de audit', async () => {
    const params: TechnicalVisitImageParamDTO = {
      technicalVisitId: visitId,
      imageId,
    };
    const row = new TechnicalVisitImageResponseDTO();
    execute.mockResolvedValue(row);
    const request = { headers: {} } as never;

    await expect(controller.handle(params, actor, request)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(
      visitId,
      imageId,
      actor,
      expect.objectContaining({ actorId: actor.id }),
    );
  });
});
