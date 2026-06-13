import type { MovementAircraftSnapshot } from '@/generated/prisma/client';

import type { StorageService } from '@/modules/storage/services/storage.service';

import type { MovementWithSnapshot } from '../mappers/movement.mapper';
import type { MovementRepository } from '../repositories/movement.repository';

import { ListMovementsService } from './list-movements.service';

describe('ListMovementsService', () => {
  let service: ListMovementsService;
  let findMany: jest.Mock;
  let count: jest.Mock;
  let getPresignedUrl: jest.Mock;

  const snapshot = (
    over: Partial<MovementAircraftSnapshot> = {},
  ): MovementAircraftSnapshot => ({
    id: 's-1',
    movementId: 'r-1',
    rabRowId: 'rab-1',
    rabPeriod: '2026-06',
    marcas: 'PR-ZTT',
    proprietarios: 'ACME',
    operadores: 'ACME',
    nrSerie: '12345',
    dsModelo: 'EMB-110',
    nmFabricante: 'EMBRAER',
    cdTipoIcao: 'E110',
    nrPmd: '5900',
    nrAssentos: '21',
    nrAnoFabricacao: '1985',
    tpMotor: 'TURBOPROP',
    qtMotor: '2',
    cfOperacional: 'SIM',
    tpOperacao: 'TPP',
    createdAt: new Date('2026-06-08T16:52:40Z'),
    ...over,
  });

  const entity = (
    over: Partial<MovementWithSnapshot> = {},
  ): MovementWithSnapshot => ({
    id: 'r-1',
    registration: 'PR-ZTT',
    confidence: '0.98',
    readingDatetime: new Date('2026-06-08T16:52:39Z'),
    operationType: 'LANDING',
    source: 'AUTOMATIC',
    readingStatus: null,
    revisorId: null,
    imageKey: 'readings/2026/06/a.jpg',
    comments: null,
    aerodrome: 'SSCF',
    aircraftSnapshot: null,
    createdAt: new Date('2026-06-08T16:52:40Z'),
    updatedAt: new Date('2026-06-08T16:52:40Z'),
    deletedAt: null,
    createdBy: null,
    updatedBy: null,
    deletedBy: null,
    ...over,
  });

  beforeEach(() => {
    findMany = jest.fn();
    count = jest.fn();
    getPresignedUrl = jest.fn();
    const repo = { findMany, count } as unknown as MovementRepository;
    const storage = { getPresignedUrl } as unknown as StorageService;
    service = new ListMovementsService(repo, storage);
  });

  it('paginação padrão, envelope meta e presigned resolvido por item', async () => {
    findMany.mockResolvedValue([entity()]);
    count.mockResolvedValue(1);
    getPresignedUrl.mockResolvedValue('https://signed/a');

    const res = await service.execute({});

    expect(findMany).toHaveBeenCalledWith({}, 0, 10);
    expect(res.meta).toEqual({
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
    expect(res.data[0].imageUrl).toBe('https://signed/a');
    expect(res.data[0].readingDatetime).toBe('2026-06-08T16:52:39.000Z');
    expect(res.data[0].operationType).toBe('LANDING');
    expect(res.data[0].source).toBe('AUTOMATIC');
    expect(res.data[0].aircraftSnapshot).toBeNull();
    expect(res.data[0]).not.toHaveProperty('confidence');
  });

  it('projeta aircraftSnapshot quando presente', async () => {
    findMany.mockResolvedValue([entity({ aircraftSnapshot: snapshot() })]);
    count.mockResolvedValue(1);
    getPresignedUrl.mockResolvedValue('https://signed/a');

    const res = await service.execute({});

    expect(res.data[0].aircraftSnapshot).toEqual({
      rabRowId: 'rab-1',
      rabPeriod: '2026-06',
      marcas: 'PR-ZTT',
      proprietarios: 'ACME',
      operadores: 'ACME',
      nrSerie: '12345',
      dsModelo: 'EMB-110',
      nmFabricante: 'EMBRAER',
      cdTipoIcao: 'E110',
      nrPmd: '5900',
      nrAssentos: '21',
      nrAnoFabricacao: '1985',
      tpMotor: 'TURBOPROP',
      qtMotor: '2',
      cfOperacional: 'SIM',
      tpOperacao: 'TPP',
      createdAt: '2026-06-08T16:52:40.000Z',
    });
    expect(res.data[0].aircraftSnapshot).not.toHaveProperty('confidence');
  });

  it('monta where com filtros e intervalo de datas', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);

    type ReadingWhere = {
      registration?: string;
      aerodrome?: string;
      readingStatus?: string;
      readingDatetime?: { gte?: Date; lte?: Date };
    };
    let captured: ReadingWhere = {};
    findMany.mockImplementation((where: ReadingWhere) => {
      captured = where;
      return Promise.resolve([]);
    });

    await service.execute({
      registration: 'PR-ZTT',
      aerodrome: 'SSCF',
      reading_status: 'APPROVED',
      start_date: '2026-05-01',
      end_date: '2026-05-31',
    });

    /** Filtro normalizado para a forma canônica do banco (entrada "PR-ZTT"). */
    expect(captured.registration).toBe('PRZTT');
    expect(captured.aerodrome).toBe('SSCF');
    expect(captured.readingStatus).toBe('APPROVED');
    expect(captured.readingDatetime?.gte).toEqual(
      new Date('2026-05-01T00:00:00.000Z'),
    );
    expect(captured.readingDatetime?.lte).toEqual(
      new Date('2026-05-31T23:59:59.999Z'),
    );
  });

  it('imageUrl null quando o item não tem imageKey', async () => {
    findMany.mockResolvedValue([entity({ imageKey: null })]);
    count.mockResolvedValue(1);

    const res = await service.execute({});

    expect(getPresignedUrl).not.toHaveBeenCalled();
    expect(res.data[0].imageUrl).toBeNull();
  });
});
