import { OperationalAerodromeParamDTO } from '../dtos/operational-aerodrome-param.dto';
import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';
import type { RemoveOperationalAerodromeService } from '../services/remove-operational-aerodrome.service';

import { RemoveOperationalAerodromeController } from './remove-operational-aerodrome.controller';

describe('RemoveOperationalAerodromeController', () => {
  let controller: RemoveOperationalAerodromeController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveOperationalAerodromeController({
      execute,
    } as unknown as RemoveOperationalAerodromeService);
  });

  it('deletedBy system', async () => {
    const params: OperationalAerodromeParamDTO = {
      operationalAerodromeId: '77777777-7777-4777-8777-777777777777',
    };
    const row = new OperationalAerodromeResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.operationalAerodromeId,
      deletedBy: 'system',
    });
  });
});
