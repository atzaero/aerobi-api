import { MovementSource, MovementType } from '@/generated/prisma/enums';

import type { CreateManualMovementDTO } from '../dtos/create-manual-movement.dto';
import type { CreateMovementService } from '../services/create-movement.service';

import { CreateManualMovementController } from './create-manual-movement.controller';

describe('CreateManualMovementController', () => {
  let controller: CreateManualMovementController;
  let execute: jest.Mock;

  const baseDto: CreateManualMovementDTO = {
    registration: 'PR-ABC',
    reading_datetime: new Date('2026-06-08T16:52:39Z'),
    aerodrome: 'SBSP',
    operationType: MovementType.TAKEOFF,
  };

  beforeEach(() => {
    execute = jest.fn().mockResolvedValue({
      id: 'm-1',
      message: 'Reading registered successfully',
      image_path: null,
    });
    const service = { execute } as unknown as CreateMovementService;
    controller = new CreateManualMovementController(service);
  });

  it('delega ao service com origem MANUAL, operationType do form e createdBy do body', async () => {
    const dto = { ...baseDto, createdBy: 'user-7' };

    const res = await controller.handle(dto);

    expect(res.id).toBe('m-1');
    expect(execute).toHaveBeenCalledWith(
      dto,
      {
        source: MovementSource.MANUAL,
        createdBy: 'user-7',
        operationType: MovementType.TAKEOFF,
      },
      undefined,
    );
  });

  it('createdBy ausente vira null na origem', async () => {
    const image = {
      mimetype: 'image/jpeg',
      buffer: Buffer.from('img'),
    } as Express.Multer.File;

    await controller.handle(baseDto, image);

    expect(execute).toHaveBeenCalledWith(
      baseDto,
      {
        source: MovementSource.MANUAL,
        createdBy: null,
        operationType: MovementType.TAKEOFF,
      },
      image,
    );
  });
});
