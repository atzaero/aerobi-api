import { TechnicalVisitImageResponseDTO } from '../dtos/technical-visit-image-response.dto';
import { TechnicalVisitParamDTO } from '../dtos/technical-visit-param.dto';
import type { ListTechnicalVisitImagesService } from '../services/list-technical-visit-images.service';

import { ListTechnicalVisitImagesController } from './list-technical-visit-images.controller';

const visitId = '11111111-1111-4111-8111-111111111111';

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
