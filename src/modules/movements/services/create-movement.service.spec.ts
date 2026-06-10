import type { EventEmitter2 } from '@nestjs/event-emitter';

import { MovementSource, MovementType } from '@/generated/prisma/enums';

import type { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import type { StorageService } from '@/modules/storage/services/storage.service';

import type { Movement, Prisma, RabRow } from '@/generated/prisma/client';
import type { RabRowRepository } from '@/modules/rab/repositories/rab-row.repository';

import type { CreateMovementDTO } from '../dtos/create-movement.dto';
import type { MovementRepository } from '../repositories/movement.repository';

import { MOVEMENT_CREATED_EVENT } from '../events/movement-created.event';

import type { MovementOrigin } from './movement-origin';
import { CreateMovementService } from './create-movement.service';

describe('CreateMovementService', () => {
  let service: CreateMovementService;
  let create: jest.Mock;
  let upload: jest.Mock;
  let remove: jest.Mock;
  let getPresignedUrl: jest.Mock;
  let getMessage: jest.Mock;
  let findLatestByMarcas: jest.Mock;
  let findLastByRegistrationWithin48h: jest.Mock;
  let emit: jest.Mock;

  type MovementCreateInput = Prisma.MovementCreateInput;

  const baseDto: CreateMovementDTO = {
    registration: 'PR-ZTT',
    confidence: '0.98',
    reading_datetime: new Date('2026-06-08T16:52:39Z'),
    aerodrome: 'SSCF',
  };

  const automaticOrigin: MovementOrigin = {
    source: MovementSource.AUTOMATIC,
    createdBy: 'aviascan',
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
    // Por padrão sem match RAB; testes específicos sobrescrevem.
    findLatestByMarcas = jest.fn().mockResolvedValue(null);
    // Por padrão sem movimento anterior na janela de 48h (→ LANDING).
    findLastByRegistrationWithin48h = jest.fn().mockResolvedValue(null);
    emit = jest.fn();

    const repo = {
      create,
      findLastByRegistrationWithin48h,
    } as unknown as MovementRepository;
    const storage = {
      upload,
      delete: remove,
      getPresignedUrl,
    } as unknown as StorageService;
    const errors = { getMessage } as unknown as ErrorMessageService;
    const rabRowRepo = {
      findLatestByMarcas,
    } as unknown as RabRowRepository;
    const eventEmitter = { emit } as unknown as EventEmitter2;

    service = new CreateMovementService(
      repo,
      storage,
      errors,
      rabRowRepo,
      eventEmitter,
    );
  });

  it('cria sem imagem: imageKey null e image_path null', async () => {
    create.mockResolvedValue({ id: 'r-1' });

    const res = await service.execute(baseDto, automaticOrigin);

    expect(res).toEqual({
      id: 'r-1',
      message: 'Reading registered successfully',
      image_path: null,
    });
    expect(upload).not.toHaveBeenCalled();
    expect(getPresignedUrl).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        registration: 'PR-ZTT',
        imageKey: null,
        source: MovementSource.AUTOMATIC,
        createdBy: 'aviascan',
        operationType: MovementType.LANDING,
      }),
    );
  });

  it('emite movement.created após persistir com o payload do movimento', async () => {
    create.mockResolvedValue({ id: 'r-evt' });

    await service.execute(baseDto, automaticOrigin);

    expect(emit).toHaveBeenCalledWith(MOVEMENT_CREATED_EVENT, {
      movementId: 'r-evt',
      registration: 'PR-ZTT',
      aerodrome: 'SSCF',
      operationType: MovementType.LANDING,
      source: MovementSource.AUTOMATIC,
      readingDatetime: baseDto.reading_datetime,
    });
  });

  it('cria com imagem: upload na key particionada e presigned URL na resposta', async () => {
    const createInputs: Array<{ imageKey: string | null }> = [];
    create.mockImplementation((input: { imageKey: string | null }) => {
      createInputs.push(input);
      return Promise.resolve({ id: 'r-2' });
    });
    getPresignedUrl.mockResolvedValue('https://signed/url');

    const res = await service.execute(baseDto, automaticOrigin, image);

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

    await expect(
      service.execute(baseDto, automaticOrigin, pdf),
    ).rejects.toBeInstanceOf(CustomHttpException);
    expect(upload).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('compensa removendo a imagem órfã quando o create falha', async () => {
    const dbError = new Error('db down');
    create.mockRejectedValue(dbError);
    remove.mockResolvedValue(undefined);

    await expect(service.execute(baseDto, automaticOrigin, image)).rejects.toBe(
      dbError,
    );

    expect(upload).toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith(expect.stringMatching(keyPattern));
  });

  it('presigned best-effort: registro persiste e image_path vira null se a assinatura falha', async () => {
    create.mockResolvedValue({ id: 'r-3' });
    getPresignedUrl.mockRejectedValue(new Error('minio down'));

    const res = await service.execute(baseDto, automaticOrigin, image);

    expect(res).toEqual({
      id: 'r-3',
      message: 'Reading registered successfully',
      image_path: null,
    });
    expect(remove).not.toHaveBeenCalled();
  });

  it('origem MANUAL: source MANUAL, operationType do input e createdBy do body', async () => {
    create.mockResolvedValue({ id: 'm-1' });
    const manualDto = {
      registration: 'PR-ABC',
      reading_datetime: new Date('2026-06-08T16:52:39Z'),
      aerodrome: 'SBSP',
    };
    const manualOrigin: MovementOrigin = {
      source: MovementSource.MANUAL,
      createdBy: 'user-42',
      operationType: MovementType.TAKEOFF,
    };

    const res = await service.execute(manualDto, manualOrigin);

    expect(res.id).toBe('m-1');
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        registration: 'PR-ABC',
        source: MovementSource.MANUAL,
        createdBy: 'user-42',
        operationType: MovementType.TAKEOFF,
        confidence: undefined,
      }),
    );
  });

  it('snapshot RAB: com match popula aircraftSnapshot.create no input do repo', async () => {
    const rabRow = {
      id: 'rab-1',
      period: '2026-05',
      marcas: 'PR-ZTT',
      proprietarios: 'Fulano',
      operadores: 'Operador X',
      nrSerie: 'SN-123',
      dsModelo: 'EMB-810D',
      nmFabricante: 'NEIVA',
      cdTipoIcao: 'P58',
      nrPmd: '1810',
      nrAssentos: '6',
      nrAnoFabricacao: '1980',
      tpMotor: 'PISTÃO',
      qtMotor: '2',
      cfOperacional: 'TPP',
      tpOperacao: 'PRIVADA',
    } as unknown as RabRow;
    findLatestByMarcas.mockResolvedValue(rabRow);
    const createInputs: MovementCreateInput[] = [];
    create.mockImplementation((input: MovementCreateInput) => {
      createInputs.push(input);
      return Promise.resolve({ id: 's-1' });
    });

    await service.execute(baseDto, automaticOrigin);

    expect(findLatestByMarcas).toHaveBeenCalledWith('PR-ZTT');
    expect(createInputs[0].aircraftSnapshot?.create).toMatchObject({
      rabRowId: 'rab-1',
      rabPeriod: '2026-05',
      marcas: 'PR-ZTT',
      dsModelo: 'EMB-810D',
      nmFabricante: 'NEIVA',
      cfOperacional: 'TPP',
    });
  });

  it('snapshot RAB: sem match grava snapshot vazio + warning e cria o movimento', async () => {
    findLatestByMarcas.mockResolvedValue(null);
    const createInputs: MovementCreateInput[] = [];
    create.mockImplementation((input: MovementCreateInput) => {
      createInputs.push(input);
      return Promise.resolve({ id: 's-2' });
    });
    const warn = jest
      .spyOn(service['logger'], 'warn')
      .mockImplementation(() => undefined);

    const res = await service.execute(baseDto, automaticOrigin);

    expect(res.id).toBe('s-2');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('PR-ZTT'));
    expect(createInputs[0].aircraftSnapshot?.create).toMatchObject({
      rabRowId: null,
      rabPeriod: null,
      marcas: null,
      dsModelo: null,
    });
  });

  describe('regra toggle de 48h (AUTOMATIC)', () => {
    const lastMovement = (operationType: MovementType): Movement =>
      ({ id: 'prev', operationType }) as unknown as Movement;

    it('sem movimento anterior em 48h → LANDING', async () => {
      findLastByRegistrationWithin48h.mockResolvedValue(null);
      create.mockResolvedValue({ id: 't-1' });

      await service.execute(baseDto, automaticOrigin);

      expect(findLastByRegistrationWithin48h).toHaveBeenCalledWith(
        'PR-ZTT',
        'SSCF',
        baseDto.reading_datetime,
      );
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ operationType: MovementType.LANDING }),
      );
    });

    it('último movimento LANDING → TAKEOFF', async () => {
      findLastByRegistrationWithin48h.mockResolvedValue(
        lastMovement(MovementType.LANDING),
      );
      create.mockResolvedValue({ id: 't-2' });

      await service.execute(baseDto, automaticOrigin);

      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ operationType: MovementType.TAKEOFF }),
      );
    });

    it('último movimento TAKEOFF → LANDING', async () => {
      findLastByRegistrationWithin48h.mockResolvedValue(
        lastMovement(MovementType.TAKEOFF),
      );
      create.mockResolvedValue({ id: 't-3' });

      await service.execute(baseDto, automaticOrigin);

      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ operationType: MovementType.LANDING }),
      );
    });

    it('aerodrome ausente no DTO → consulta a regra com null', async () => {
      findLastByRegistrationWithin48h.mockResolvedValue(null);
      create.mockResolvedValue({ id: 't-4' });
      const dtoSemAerodromo = { ...baseDto, aerodrome: undefined };

      await service.execute(dtoSemAerodromo, automaticOrigin);

      expect(findLastByRegistrationWithin48h).toHaveBeenCalledWith(
        'PR-ZTT',
        null,
        baseDto.reading_datetime,
      );
    });

    it('MANUAL: não chama a regra e usa o operationType do formulário', async () => {
      create.mockResolvedValue({ id: 'm-2' });
      const manualOrigin: MovementOrigin = {
        source: MovementSource.MANUAL,
        createdBy: 'user-7',
        operationType: MovementType.TAKEOFF,
      };

      await service.execute(baseDto, manualOrigin);

      expect(findLastByRegistrationWithin48h).not.toHaveBeenCalled();
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ operationType: MovementType.TAKEOFF }),
      );
    });
  });
});
