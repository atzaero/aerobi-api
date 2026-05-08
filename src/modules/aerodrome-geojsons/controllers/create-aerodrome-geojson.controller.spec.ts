import {
  AerodromeGeojsonKind,
  AerodromeGeojsonStatus,
} from '@/generated/prisma/client';

import { AerodromeGeojsonResponseDTO } from '../dtos/aerodrome-geojson-response.dto';
import type { CreateAerodromeGeojsonDTO } from '../dtos/create-aerodrome-geojson.dto';
import type { CreateAerodromeGeojsonService } from '../services/create-aerodrome-geojson.service';

import { CreateAerodromeGeojsonController } from './create-aerodrome-geojson.controller';

describe('CreateAerodromeGeojsonController', () => {
  let controller: CreateAerodromeGeojsonController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new CreateAerodromeGeojsonController({
      execute,
    } as unknown as CreateAerodromeGeojsonService);
  });

  it('delega', async () => {
    const dto: CreateAerodromeGeojsonDTO = {
      operationalAerodromeId: '22222222-2222-4222-8222-222222222222',
      kind: AerodromeGeojsonKind.AERODROME_MAP,
      status: AerodromeGeojsonStatus.READY,
    };
    const row = new AerodromeGeojsonResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle(dto)).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith(dto);
  });
});
