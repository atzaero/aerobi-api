import { AerodromeGeojsonStatus } from '@/generated/prisma/client';

import { AerodromeGeojsonParamDTO } from '../dtos/aerodrome-geojson-param.dto';
import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';
import { UpdateAerodromeGeojsonDTO } from '../dtos/update-aerodrome-geojson.dto';
import type { UpdateAerodromeGeojsonService } from '../services/update-aerodrome-geojson.service';

import { UpdateAerodromeGeojsonController } from './update-aerodrome-geojson.controller';

describe('UpdateAerodromeGeojsonController', () => {
  let controller: UpdateAerodromeGeojsonController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateAerodromeGeojsonController({
      execute,
    } as unknown as UpdateAerodromeGeojsonService);
  });

  it('merge', async () => {
    const params: AerodromeGeojsonParamDTO = {
      aerodromeGeojsonId: '88888888-8888-4888-8888-888888888888',
    };
    const body: UpdateAerodromeGeojsonDTO = {
      status: AerodromeGeojsonStatus.ERROR,
    };
    const row = new AerodromeGeojsonResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, body)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.aerodromeGeojsonId,
      ...body,
    });
  });
});
