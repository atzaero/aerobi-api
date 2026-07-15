import { AerodromeParamDTO } from '../dtos/aerodrome-param.dto';
import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import type { FindAerodromeByIdService } from '../services/find-aerodrome-by-id.service';

import { FindAerodromeByIdController } from './find-aerodrome-by-id.controller';

describe('FindAerodromeByIdController', () => {
  let controller: FindAerodromeByIdController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindAerodromeByIdController({
      execute,
    } as unknown as FindAerodromeByIdService);
  });

  it('id do param', async () => {
    const params: AerodromeParamDTO = {
      id: '77777777-7777-4777-8777-777777777777',
    };
    const row = new AerodromeResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({ id: params.id });
  });
});
