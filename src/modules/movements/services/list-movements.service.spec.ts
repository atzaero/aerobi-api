import { UserRole } from '@/generated/prisma/client';
import type { MovementAircraftSnapshot } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { StorageService } from '@/modules/storage/services/storage.service';

import type { MovementWithSnapshot } from '../mappers/movement.mapper';
import type { MovementRepository } from '../repositories/movement.repository';
import type { MovementScopeService } from './movement-scope.service';

import { ListMovementsService } from './list-movements.service';

const actor: AuthenticatedUser = {
  id: 'u-1',
  email: 'a@e',
  role: UserRole.ADMIN,
};

describe('ListMovementsService', () => {
  let service: ListMovementsService;
  let findMany: jest.Mock;
  let count: jest.Mock;
  let getPresignedUrl: jest.Mock;
  let resolveScopedIcaos: jest.Mock;

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
    conformityStatus: 'PENDING',
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
    /** Por padrão ADMIN (sem restrição de escopo); testes específicos sobrescrevem. */
    resolveScopedIcaos = jest.fn().mockResolvedValue(null);
    const repo = { findMany, count } as unknown as MovementRepository;
    const storage = { getPresignedUrl } as unknown as StorageService;
    const scopeService = {
      resolveScopedIcaos,
    } as unknown as MovementScopeService;
    service = new ListMovementsService(repo, storage, scopeService);
  });

  it('paginação padrão, envelope meta, item enxuto e presigned por item', async () => {
    findMany.mockResolvedValue([entity()]);
    count.mockResolvedValue(1);
    getPresignedUrl.mockResolvedValue('https://signed/a');

    const res = await service.execute({}, actor);

    expect(findMany).toHaveBeenCalledWith({}, 0, 10);
    expect(res.meta).toEqual({
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
    expect(res.data[0]).toEqual({
      id: 'r-1',
      registration: 'PR-ZTT',
      aerodrome: 'SSCF',
      readingDatetime: '2026-06-08T16:52:39.000Z',
      imageUrl: 'https://signed/a',
      operationType: 'LANDING',
      source: 'AUTOMATIC',
      conformityStatus: 'PENDING',
    });
  });

  it('item enxuto não expõe snapshot, status, revisor, comments nem timestamps', async () => {
    findMany.mockResolvedValue([entity({ aircraftSnapshot: snapshot() })]);
    count.mockResolvedValue(1);
    getPresignedUrl.mockResolvedValue('https://signed/a');

    const res = await service.execute({}, actor);

    expect(res.data[0]).not.toHaveProperty('aircraftSnapshot');
    expect(res.data[0]).not.toHaveProperty('readingStatus');
    expect(res.data[0]).not.toHaveProperty('revisorId');
    expect(res.data[0]).not.toHaveProperty('comments');
    expect(res.data[0]).not.toHaveProperty('createdAt');
    expect(res.data[0]).not.toHaveProperty('updatedAt');
    expect(res.data[0]).not.toHaveProperty('confidence');
  });

  it('monta where com filtros (incl. operation_type/source) e intervalo de datas', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);

    type ReadingWhere = {
      registration?: string;
      aerodrome?: string;
      readingStatus?: string;
      operationType?: string;
      source?: string;
      conformityStatus?: string;
      readingDatetime?: { gte?: Date; lte?: Date };
    };
    let captured: ReadingWhere = {};
    findMany.mockImplementation((where: ReadingWhere) => {
      captured = where;
      return Promise.resolve([]);
    });

    await service.execute(
      {
        registration: 'PR-ZTT',
        aerodrome: 'SSCF',
        reading_status: 'APPROVED',
        operation_type: 'TAKEOFF',
        source: 'MANUAL',
        conformity_status: 'NON_CONFORMANT',
        start_date: '2026-05-01',
        end_date: '2026-05-31',
      },
      actor,
    );

    /** Filtro normalizado para a forma canônica do banco (entrada "PR-ZTT"). */
    expect(captured.registration).toBe('PRZTT');
    expect(captured.aerodrome).toBe('SSCF');
    expect(captured.readingStatus).toBe('APPROVED');
    expect(captured.operationType).toBe('TAKEOFF');
    expect(captured.source).toBe('MANUAL');
    expect(captured.conformityStatus).toBe('NON_CONFORMANT');
    expect(captured.readingDatetime?.gte).toEqual(
      new Date('2026-05-01T00:00:00.000Z'),
    );
    expect(captured.readingDatetime?.lte).toEqual(
      new Date('2026-05-31T23:59:59.999Z'),
    );
  });

  it('aplica o escopo por ICAO ao where (coordinator restrito ao grupo)', async () => {
    resolveScopedIcaos.mockResolvedValue(['SSCF', 'SBSP']);
    let captured: Record<string, unknown> = {};
    findMany.mockImplementation((where: Record<string, unknown>) => {
      captured = where;
      return Promise.resolve([]);
    });
    count.mockResolvedValue(0);

    await service.execute({}, actor);

    expect(captured).toEqual({
      AND: [{}, { aerodrome: { in: ['SSCF', 'SBSP'] } }],
    });
  });

  it('coordinator sem grupo: fail-closed (aerodrome IN [])', async () => {
    resolveScopedIcaos.mockResolvedValue([]);
    let captured: Record<string, unknown> = {};
    findMany.mockImplementation((where: Record<string, unknown>) => {
      captured = where;
      return Promise.resolve([]);
    });
    count.mockResolvedValue(0);

    await service.execute({}, actor);

    expect(captured).toEqual({ AND: [{}, { aerodrome: { in: [] } }] });
  });

  it('imageUrl null quando o item não tem imageKey', async () => {
    findMany.mockResolvedValue([entity({ imageKey: null })]);
    count.mockResolvedValue(1);

    const res = await service.execute({}, actor);

    expect(getPresignedUrl).not.toHaveBeenCalled();
    expect(res.data[0].imageUrl).toBeNull();
  });
});
