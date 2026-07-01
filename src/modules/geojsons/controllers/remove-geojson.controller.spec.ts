import { GeojsonParamDTO } from '../dtos/geojson-param.dto';
import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';
import type { RemoveGeojsonService } from '../services/remove-geojson.service';

import { RemoveGeojsonController } from './remove-geojson.controller';

describe('RemoveGeojsonController', () => {
  let controller: RemoveGeojsonController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new RemoveGeojsonController({
      execute,
    } as unknown as RemoveGeojsonService);
  });

  it('deletedBy system', async () => {
    const params: GeojsonParamDTO = {
      geojsonId: '88888888-8888-4888-8888-888888888888',
    };
    const row = new GeojsonResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.geojsonId,
      deletedBy: 'system',
    });
  });
});
