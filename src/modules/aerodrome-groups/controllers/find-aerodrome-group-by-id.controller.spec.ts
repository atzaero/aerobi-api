import { AerodromeGroupParamDTO } from '../dtos/aerodrome-group-param.dto';
import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import type { FindAerodromeGroupByIdService } from '../services/find-aerodrome-group-by-id.service';

import { FindAerodromeGroupByIdController } from './find-aerodrome-group-by-id.controller';

describe('FindAerodromeGroupByIdController', () => {
  let controller: FindAerodromeGroupByIdController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindAerodromeGroupByIdController({
      execute,
    } as unknown as FindAerodromeGroupByIdService);
  });

  it('id a partir do param', async () => {
    const params: AerodromeGroupParamDTO = {
      aerodromeGroupId: '44444444-4444-4444-8444-444444444444',
    };
    const row = new AerodromeGroupResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({ id: params.aerodromeGroupId });
  });
});
