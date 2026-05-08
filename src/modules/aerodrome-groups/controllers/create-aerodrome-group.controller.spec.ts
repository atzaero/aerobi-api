import { Uf } from '@/generated/prisma/client';

import { AerodromeGroupResponseDTO } from '../dtos/aerodrome-group-response.dto';
import { CreateAerodromeGroupDTO } from '../dtos/create-aerodrome-group.dto';
import type { CreateAerodromeGroupService } from '../services/create-aerodrome-group.service';

import { CreateAerodromeGroupController } from './create-aerodrome-group.controller';

describe('CreateAerodromeGroupController', () => {
  let controller: CreateAerodromeGroupController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreateAerodromeGroupController({
      execute,
    } as unknown as CreateAerodromeGroupService);
  });

  it('delega', async () => {
    const dto: CreateAerodromeGroupDTO = {
      uf: Uf.SP,
      groupName: 'G',
    };
    const row = new AerodromeGroupResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(dto)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(dto);
  });
});
