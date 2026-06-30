import { GroupParamDTO } from '../dtos/group-param.dto';
import { GroupResponseDTO } from '../dtos/group-response.dto';
import type { FindGroupByIdService } from '../services/find-group-by-id.service';

import { FindGroupByIdController } from './find-group-by-id.controller';

describe('FindGroupByIdController', () => {
  let controller: FindGroupByIdController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindGroupByIdController({
      execute,
    } as unknown as FindGroupByIdService);
  });

  it('id a partir do param', async () => {
    const params: GroupParamDTO = {
      id: '44444444-4444-4444-8444-444444444444',
    };
    const row = new GroupResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(params.id);
  });
});
