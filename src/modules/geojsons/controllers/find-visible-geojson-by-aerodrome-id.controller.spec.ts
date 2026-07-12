import { GeojsonAerodromeIdParamDTO } from '../dtos/geojson-aerodrome-id-param.dto';
import { GeojsonForAerodromeResponseDTO } from '../dtos/geojson-for-aerodrome-response.dto';
import type { FindVisibleGeojsonByAerodromeIdService } from '../services/find-visible-geojson-by-aerodrome-id.service';

import { FindVisibleGeojsonByAerodromeIdController } from './find-visible-geojson-by-aerodrome-id.controller';

describe('FindVisibleGeojsonByAerodromeIdController', () => {
  let controller: FindVisibleGeojsonByAerodromeIdController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindVisibleGeojsonByAerodromeIdController({
      execute,
    } as unknown as FindVisibleGeojsonByAerodromeIdService);
  });

  it('delega o aerodromeId do param', async () => {
    const params: GeojsonAerodromeIdParamDTO = {
      aerodromeId: '22222222-2222-4222-8222-222222222222',
    };
    const row = new GeojsonForAerodromeResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      aerodromeId: params.aerodromeId,
    });
  });
});
