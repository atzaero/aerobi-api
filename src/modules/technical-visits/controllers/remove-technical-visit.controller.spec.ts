import { TechnicalVisitParamDTO } from '../dtos/technical-visit-param.dto';
import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import type { RemoveTechnicalVisitService } from '../services/remove-technical-visit.service';

import { RemoveTechnicalVisitController } from './remove-technical-visit.controller';

describe('RemoveTechnicalVisitController', () => {
  let controller: RemoveTechnicalVisitController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveTechnicalVisitController({
      execute,
    } as unknown as RemoveTechnicalVisitService);
  });

  it('deletedBy system', async () => {
    const params: TechnicalVisitParamDTO = {
      technicalVisitId: '66666666-6666-4666-8666-666666666666',
    };
    const row = new TechnicalVisitResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.technicalVisitId,
      deletedBy: 'system',
    });
  });
});
