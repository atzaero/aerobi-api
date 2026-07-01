import { GeojsonStatus } from '@/generated/prisma/client';

import { GeojsonParamDTO } from '../dtos/geojson-param.dto';
import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';
import { UpdateGeojsonDTO } from '../dtos/update-geojson.dto';
import type { UpdateGeojsonService } from '../services/update-geojson.service';

import { UpdateGeojsonController } from './update-geojson.controller';

describe('UpdateGeojsonController', () => {
  let controller: UpdateGeojsonController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UpdateGeojsonController({
      execute,
    } as unknown as UpdateGeojsonService);
  });

  it('merge', async () => {
    const params: GeojsonParamDTO = {
      geojsonId: '88888888-8888-4888-8888-888888888888',
    };
    const body: UpdateGeojsonDTO = {
      status: GeojsonStatus.ERROR,
    };
    const row = new GeojsonResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(params, body)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({
      id: params.geojsonId,
      ...body,
    });
  });
});
