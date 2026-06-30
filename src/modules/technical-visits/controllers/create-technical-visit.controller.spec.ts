import { TechnicalVisitResponseDTO } from '../dtos/technical-visit-response.dto';
import type { CreateTechnicalVisitDTO } from '../dtos/create-technical-visit.dto';
import type { CreateTechnicalVisitService } from '../services/create-technical-visit.service';

import { CreateTechnicalVisitController } from './create-technical-visit.controller';

describe('CreateTechnicalVisitController', () => {
  let controller: CreateTechnicalVisitController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreateTechnicalVisitController({
      execute,
    } as unknown as CreateTechnicalVisitService);
  });

  it('delega', async () => {
    const dto: CreateTechnicalVisitDTO = {
      aerodromeId: '22222222-2222-4222-8222-222222222222',
      visitAt: new Date(),
    };
    const row = new TechnicalVisitResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(dto)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(dto);
  });
});
