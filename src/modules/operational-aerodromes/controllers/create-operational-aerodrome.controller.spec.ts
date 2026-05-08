import { OperationalAerodromeResponseDTO } from '../dtos/operational-aerodrome-response.dto';
import type { CreateOperationalAerodromeDTO } from '../dtos/create-operational-aerodrome.dto';
import type { CreateOperationalAerodromeService } from '../services/create-operational-aerodrome.service';

import { CreateOperationalAerodromeController } from './create-operational-aerodrome.controller';

describe('CreateOperationalAerodromeController', () => {
  let controller: CreateOperationalAerodromeController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreateOperationalAerodromeController({
      execute,
    } as unknown as CreateOperationalAerodromeService);
  });

  it('delega', async () => {
    const dto: CreateOperationalAerodromeDTO = {
      groupId: '44444444-4444-4444-8444-444444444444',
      icao: 'SBSP',
      name: 'Congonhas',
      latitude: '1',
      longitude: '2',
      isOpen: true,
      isView: false,
    };
    const row = new OperationalAerodromeResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(dto)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(dto);
  });
});
