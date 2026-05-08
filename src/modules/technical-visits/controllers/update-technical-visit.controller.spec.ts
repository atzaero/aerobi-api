import { TechnicalVisitParamDTO } from '../dtos/technical-visit-param.dto';
import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import { UpdateTechnicalVisitDTO } from '../dtos/update-technical-visit.dto';
import type { UpdateTechnicalVisitService } from '../services/update-technical-visit.service';

import { UpdateTechnicalVisitController } from './update-technical-visit.controller';

describe('UpdateTechnicalVisitController', () => {
  let controller: UpdateTechnicalVisitController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateTechnicalVisitController({
      execute,
    } as unknown as UpdateTechnicalVisitService);
  });

  it('merge params e body', async () => {
    const params: TechnicalVisitParamDTO = {
      technicalVisitId: '66666666-6666-4666-8666-666666666666',
    };
    const body: UpdateTechnicalVisitDTO = { modifierUsers: ['x'] };
    const row = new TechnicalVisitResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, body)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.technicalVisitId,
      ...body,
    });
  });
});
