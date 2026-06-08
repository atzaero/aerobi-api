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
  let remove: jest.Mock;
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

  const keyPattern = /^readings\/2026\/06\/[0-9a-f-]+\.jpg$/;

  beforeEach(() => {
    create = jest.fn();
    upload = jest.fn();
    remove = jest.fn();
    getPresignedUrl = jest.fn();
    getMessage = jest.fn().mockReturnValue('validação falhou');

    const repo = { create } as unknown as AircraftReadingRepository;
    const storage = {
      upload,
      delete: remove,
      getPresignedUrl,
    } as unknown as StorageService;
    const errors = { getMessage } as unknown as ErrorMessageService;

    service = new CreateAircraftReadingService(repo, storage, errors);
  });

  it('cria sem imagem: imageKey null e image_path null', async () => {
    create.mockResolvedValue({ id: 'r-1' });

    const res = await service.execute(baseDto);

    expect(res).toEqual({
      id: 'r-1',
      message: 'Reading registered successfully',
      image_path: null,
    });
    expect(upload).not.toHaveBeenCalled();
    expect(getPresignedUrl).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ registration: 'PR-ZTT', imageKey: null }),
    );
  });

  it('cria com imagem: upload na key particionada e presigned URL na resposta', async () => {
    const createInputs: Array<{ imageKey: string | null }> = [];
    create.mockImplementation((input: { imageKey: string | null }) => {
      createInputs.push(input);
      return Promise.resolve({ id: 'r-2' });
    });
    getPresignedUrl.mockResolvedValue('https://signed/url');

    const res = await service.execute(baseDto, image);

    expect(upload).toHaveBeenCalledWith(
      image,
      expect.stringMatching(keyPattern),
    );
    expect(createInputs[0].imageKey).toMatch(keyPattern);
    expect(res).toEqual({
      id: 'r-2',
      message: 'Reading registered successfully',
      image_path: 'https://signed/url',
    });
  });

  it('rejeita mimetype não permitido sem tocar no banco/storage', async () => {
    const pdf = { ...image, mimetype: 'application/pdf' };

    await expect(service.execute(baseDto, pdf)).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(upload).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('compensa removendo a imagem órfã quando o create falha', async () => {
    const dbError = new Error('db down');
    create.mockRejectedValue(dbError);
    remove.mockResolvedValue(undefined);

    await expect(service.execute(baseDto, image)).rejects.toBe(dbError);

    expect(upload).toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith(expect.stringMatching(keyPattern));
  });

  it('presigned best-effort: registro persiste e image_path vira null se a assinatura falha', async () => {
    create.mockResolvedValue({ id: 'r-3' });
    getPresignedUrl.mockRejectedValue(new Error('minio down'));

    const res = await service.execute(baseDto, image);

    expect(res).toEqual({
      id: 'r-3',
      message: 'Reading registered successfully',
      image_path: null,
    });
    expect(remove).not.toHaveBeenCalled();
  });
});
