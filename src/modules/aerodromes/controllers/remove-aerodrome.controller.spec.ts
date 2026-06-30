import { AerodromeParamDTO } from '../dtos/aerodrome-param.dto';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import type { RemoveAerodromeService } from '../services/remove-aerodrome.service';

import { RemoveAerodromeController } from './remove-aerodrome.controller';

describe('RemoveAerodromeController', () => {
  let controller: RemoveAerodromeController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveAerodromeController({
      execute,
    } as unknown as RemoveAerodromeService);
  });

  it('deletedBy system', async () => {
    const params: AerodromeParamDTO = {
      aerodromeId: '77777777-7777-4777-8777-777777777777',
    };
    const row = new AerodromeResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.aerodromeId,
      deletedBy: 'system',
    });
  });
});
