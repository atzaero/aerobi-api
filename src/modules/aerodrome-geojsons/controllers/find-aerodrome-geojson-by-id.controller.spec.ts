import { AerodromeGeojsonParamDTO } from '../dtos/aerodrome-geojson-param.dto';
import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';
import type { FindAerodromeGeojsonByIdService } from '../services/find-aerodrome-geojson-by-id.service';

import { FindAerodromeGeojsonByIdController } from './find-aerodrome-geojson-by-id.controller';

describe('FindAerodromeGeojsonByIdController', () => {
  let controller: FindAerodromeGeojsonByIdController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindAerodromeGeojsonByIdController({
      execute,
    } as unknown as FindAerodromeGeojsonByIdService);
  });

  it('id do param', async () => {
    const params: AerodromeGeojsonParamDTO = {
      aerodromeGeojsonId: '88888888-8888-4888-8888-888888888888',
    };
    const row = new AerodromeGeojsonResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({ id: params.aerodromeGeojsonId });
  });
});
