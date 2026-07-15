import { GeojsonParamDTO } from '../dtos/geojson-param.dto';
import { GeojsonForAerodromeResponseDTO } from '../dtos/geojson-for-aerodrome-response.dto';
import type { FindGeojsonForAerodromeService } from '../services/find-geojson-for-aerodrome.service';

import { FindGeojsonForAerodromeController } from './find-geojson-for-aerodrome.controller';

describe('FindGeojsonForAerodromeController', () => {
  let controller: FindGeojsonForAerodromeController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindGeojsonForAerodromeController({
      execute,
    } as unknown as FindGeojsonForAerodromeService);
  });

  it('delega o param `id` como aerodromeId', async () => {
    const params: GeojsonParamDTO = {
      id: '22222222-2222-4222-8222-222222222222',
    };
    const row = new GeojsonForAerodromeResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({ aerodromeId: params.id });
  });
});
