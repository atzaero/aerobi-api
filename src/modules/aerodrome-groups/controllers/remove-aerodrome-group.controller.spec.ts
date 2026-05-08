import { AerodromeGroupParamDTO } from '../dtos/aerodrome-group-param.dto';
import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import type { RemoveAerodromeGroupService } from '../services/remove-aerodrome-group.service';

import { RemoveAerodromeGroupController } from './remove-aerodrome-group.controller';

describe('RemoveAerodromeGroupController', () => {
  let controller: RemoveAerodromeGroupController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveAerodromeGroupController({
      execute,
    } as unknown as RemoveAerodromeGroupService);
  });

  it('deletedBy system', async () => {
    const params: AerodromeGroupParamDTO = {
      aerodromeGroupId: '44444444-4444-4444-8444-444444444444',
    };
    const row = new AerodromeGroupResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.aerodromeGroupId,
      deletedBy: 'system',
    });
  });
});
