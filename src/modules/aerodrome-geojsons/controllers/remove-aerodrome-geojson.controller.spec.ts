import { AerodromeGeojsonParamDTO } from '../dtos/aerodrome-geojson-param.dto';
import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';
import type { RemoveAerodromeGeojsonService } from '../services/remove-aerodrome-geojson.service';

import { RemoveAerodromeGeojsonController } from './remove-aerodrome-geojson.controller';

describe('RemoveAerodromeGeojsonController', () => {
  let controller: RemoveAerodromeGeojsonController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveAerodromeGeojsonController({
      execute,
    } as unknown as RemoveAerodromeGeojsonService);
  });

  it('deletedBy system', async () => {
    const params: AerodromeGeojsonParamDTO = {
      aerodromeGeojsonId: '88888888-8888-4888-8888-888888888888',
    };
    const row = new AerodromeGeojsonResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.aerodromeGeojsonId,
      deletedBy: 'system',
    });
  });
});
