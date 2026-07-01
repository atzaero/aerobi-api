import { GeojsonKind, GeojsonStatus } from '@/generated/prisma/client';

import { GeojsonResponseDTO } from '../dtos/geojson-response.dto';
import type { CreateGeojsonDTO } from '../dtos/create-geojson.dto';
import type { CreateGeojsonService } from '../services/create-geojson.service';

import { CreateGeojsonController } from './create-geojson.controller';

describe('CreateGeojsonController', () => {
  let controller: CreateGeojsonController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreateGeojsonController({
      execute,
    } as unknown as CreateGeojsonService);
  });

  it('delega', async () => {
    const dto: CreateGeojsonDTO = {
      aerodromeId: '22222222-2222-4222-8222-222222222222',
      kind: GeojsonKind.AERODROME_MAP,
      status: GeojsonStatus.READY,
    };
    const row = new GeojsonResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(dto)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(dto);
  });
});
