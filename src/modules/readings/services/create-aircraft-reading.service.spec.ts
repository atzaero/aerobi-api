import type { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { StorageService } from '@/modules/storage/services/storage.service';

import type { CreateAircraftReadingDTO } from '../dtos/create-aircraft-reading.dto';
import type { AircraftReadingRepository } from '../repositories/aircraft-reading.repository';

import { CreateAircraftReadingService } from './create-aircraft-reading.service';

describe('CreateAircraftReadingService', () => {
  let service: CreateAircraftReadingService;
  let create: jest.Mock;
  let upload: jest.Mock;
  let getPresignedUrl: jest.Mock;
  let getMessage: jest.Mock;

  const baseDto: CreateAircraftReadingDTO = {
    registration: 'PR-ZTT',
    confidence: '0.98',
    reading_datetime: new Date('2026-06-08T16:52:39Z'),
    aerodrome: 'SSCF',
  };

  const image = {
    originalname: 'foto.jpg',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('img'),
  } as Express.Multer.File;

  beforeEach(() => {
    create = jest.fn();
    upload = jest.fn();
    getPresignedUrl = jest.fn();
    getMessage = jest.fn().mockReturnValue('validação falhou');

    const repo = { create } as unknown as AircraftReadingRepository;
    const storage = { upload, getPresignedUrl } as unknown as StorageService;
    const errors = { getMessage } as unknown as ErrorMessageService;

    service = new CreateAircraftReadingService(repo, storage, errors);
  });

  it('cria sem imagem: imageKey null e image_path null', async () => {
    create.mockResolvedValue({ id: 'r-1' });

    const res = await service.execute(baseDto);

    expect(res).toEqual({
      id: 'r-1',
      message: 'Reading created successfully',
      image_path: null,
    });
    expect(upload).not.toHaveBeenCalled();
    expect(getPresignedUrl).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ registration: 'PR-ZTT', imageKey: null }),
    );
  });

  it('cria com imagem: faz upload na key particionada e retorna presigned URL', async () => {
    create.mockResolvedValue({ id: 'r-2' });
    getPresignedUrl.mockResolvedValue('https://signed/url');

    const res = await service.execute(baseDto, image);

    const expectedKeyPattern = /^readings\/2026\/06\/[0-9a-f-]+\.jpg$/;
    expect(upload).toHaveBeenCalledWith(
      image,
      expect.stringMatching(expectedKeyPattern),
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        imageKey: expect.stringMatching(expectedKeyPattern) as unknown,
      }),
    );
    expect(getPresignedUrl).toHaveBeenCalled();
    expect(res).toEqual({
      id: 'r-2',
      message: 'Reading created successfully',
      image_path: 'https://signed/url',
    });
  });

  it('rejeita mimetype não permitido sem tocar no banco/storage', async () => {
    const pdf = {
      ...image,
      mimetype: 'application/pdf',
    };

    await expect(service.execute(baseDto, pdf)).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(upload).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });
});
