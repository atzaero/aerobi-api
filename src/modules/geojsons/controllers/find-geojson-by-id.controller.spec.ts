import { GeojsonParamDTO } from '../dtos/geojson-param.dto';
import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';
import type { FindGeojsonByIdService } from '../services/find-geojson-by-id.service';

import { FindGeojsonByIdController } from './find-geojson-by-id.controller';

describe('FindGeojsonByIdController', () => {
  let controller: FindGeojsonByIdController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindGeojsonByIdController({
      execute,
    } as unknown as FindGeojsonByIdService);
  });

  it('id do param', async () => {
    const params: GeojsonParamDTO = {
      geojsonId: '88888888-8888-4888-8888-888888888888',
    };
    const row = new GeojsonResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({ id: params.geojsonId });
  });
});
