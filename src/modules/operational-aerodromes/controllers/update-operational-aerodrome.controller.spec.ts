import { OperationalAerodromeParamDTO } from '../dtos/operational-aerodrome-param.dto';
import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';
import { UpdateOperationalAerodromeDTO } from '../dtos/update-operational-aerodrome.dto';
import type { UpdateOperationalAerodromeService } from '../services/update-operational-aerodrome.service';

import { UpdateOperationalAerodromeController } from './update-operational-aerodrome.controller';

describe('UpdateOperationalAerodromeController', () => {
  let controller: UpdateOperationalAerodromeController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateOperationalAerodromeController({
      execute,
    } as unknown as UpdateOperationalAerodromeService);
  });

  it('merge', async () => {
    const params: OperationalAerodromeParamDTO = {
      operationalAerodromeId: '77777777-7777-4777-8777-777777777777',
    };
    const body: UpdateOperationalAerodromeDTO = {
      name: 'Nome',
      groupId: '44444444-4444-4444-8444-444444444444',
    };
    const row = new OperationalAerodromeResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, body)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.operationalAerodromeId,
      ...body,
    });
  });
});
