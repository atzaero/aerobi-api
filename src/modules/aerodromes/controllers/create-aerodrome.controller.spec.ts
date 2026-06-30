import { AerodromeResponseDTO } from '../dtos/aerodrome-response.dto';
import type { CreateAerodromeDTO } from '../dtos/create-aerodrome.dto';
import type { CreateAerodromeService } from '../services/create-aerodrome.service';

import { CreateAerodromeController } from './create-aerodrome.controller';

describe('CreateAerodromeController', () => {
  let controller: CreateAerodromeController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreateAerodromeController({
      execute,
    } as unknown as CreateAerodromeService);
  });

  it('delega', async () => {
    const dto: CreateAerodromeDTO = {
      groupId: '44444444-4444-4444-8444-444444444444',
      icao: 'SBSP',
      name: 'Congonhas',
      latitude: '1',
      longitude: '2',
      isOpen: true,
      isView: false,
    };
    const row = new AerodromeResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(dto)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(dto);
  });
});
