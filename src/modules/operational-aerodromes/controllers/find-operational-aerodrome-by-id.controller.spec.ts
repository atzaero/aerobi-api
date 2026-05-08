import { OperationalAerodromeParamDTO } from '../dtos/operational-aerodrome-param.dto';
import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';
import type { FindOperationalAerodromeByIdService } from '../services/find-operational-aerodrome-by-id.service';

import { FindOperationalAerodromeByIdController } from './find-operational-aerodrome-by-id.controller';

describe('FindOperationalAerodromeByIdController', () => {
  let controller: FindOperationalAerodromeByIdController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindOperationalAerodromeByIdController({
      execute,
    } as unknown as FindOperationalAerodromeByIdService);
  });

  it('id do param', async () => {
    const params: OperationalAerodromeParamDTO = {
      operationalAerodromeId: '77777777-7777-4777-8777-777777777777',
    };
    const row = new OperationalAerodromeResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.operationalAerodromeId,
    });
  });
});
