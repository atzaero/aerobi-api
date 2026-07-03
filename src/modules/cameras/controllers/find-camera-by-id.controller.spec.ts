import { CameraResponseDTO } from '../dtos/camera-response.dto';
import type { FindCameraByIdService } from '../services/find-camera-by-id.service';

import { FindCameraByIdController } from './find-camera-by-id.controller';

describe('FindCameraByIdController', () => {
  let controller: FindCameraByIdController;
  let execute: jest.Mock;

  beforeEach(() => {
    execute = jest.fn();
    controller = new FindCameraByIdController({
      execute,
    } as unknown as FindCameraByIdService);
  });

  it('delega o id do param ao service', async () => {
    const row = new CameraResponseDTO();
    execute.mockResolvedValue(row);
    await expect(controller.handle({ id: 'c1' })).resolves.toBe(row);
    expect(execute).toHaveBeenCalledWith({ id: 'c1' });
  });
});
