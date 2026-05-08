import { AerodromeGroupParamDTO } from '../dtos/aerodrome-group-param.dto';
import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { UpdateAerodromeGroupDTO } from '../dtos/update-aerodrome-group.dto';
import type { UpdateAerodromeGroupService } from '../services/update-aerodrome-group.service';

import { UpdateAerodromeGroupController } from './update-aerodrome-group.controller';

describe('UpdateAerodromeGroupController', () => {
  let controller: UpdateAerodromeGroupController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateAerodromeGroupController({
      execute,
    } as unknown as UpdateAerodromeGroupService);
  });

  it('merge params e body', async () => {
    const params: AerodromeGroupParamDTO = {
      aerodromeGroupId: '44444444-4444-4444-8444-444444444444',
    };
    const body: UpdateAerodromeGroupDTO = { groupName: 'X' };
    const row = new AerodromeGroupResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, body)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.aerodromeGroupId,
      ...body,
    });
  });
});
