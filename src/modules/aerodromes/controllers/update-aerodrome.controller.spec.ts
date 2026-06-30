import { AerodromeParamDTO } from '../dtos/aerodrome-param.dto';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import { UpdateAerodromeDTO } from '../dtos/update-aerodrome.dto';
import type { UpdateAerodromeService } from '../services/update-aerodrome.service';

import { UpdateAerodromeController } from './update-aerodrome.controller';

describe('UpdateAerodromeController', () => {
  let controller: UpdateAerodromeController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateAerodromeController({
      execute,
    } as unknown as UpdateAerodromeService);
  });

  it('merge', async () => {
    const params: AerodromeParamDTO = {
      aerodromeId: '77777777-7777-4777-8777-777777777777',
    };
    const body: UpdateAerodromeDTO = {
      name: 'Nome',
      groupId: '44444444-4444-4444-8444-444444444444',
    };
    const row = new AerodromeResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, body)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.aerodromeId,
      ...body,
    });
  });
});
