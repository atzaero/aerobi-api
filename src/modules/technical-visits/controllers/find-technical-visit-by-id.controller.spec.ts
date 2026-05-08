import { TechnicalVisitParamDTO } from '../dtos/technical-visit-param.dto';
import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import type { FindTechnicalVisitByIdService } from '../services/find-technical-visit-by-id.service';

import { FindTechnicalVisitByIdController } from './find-technical-visit-by-id.controller';

describe('FindTechnicalVisitByIdController', () => {
  let controller: FindTechnicalVisitByIdController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindTechnicalVisitByIdController({
      execute,
    } as unknown as FindTechnicalVisitByIdService);
  });

  it('id do param', async () => {
    const params: TechnicalVisitParamDTO = {
      technicalVisitId: '66666666-6666-4666-8666-666666666666',
    };
    const row = new TechnicalVisitResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({ id: params.technicalVisitId });
  });
});
