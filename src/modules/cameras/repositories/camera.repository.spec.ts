import type { PrismaService } from '@/prisma/prisma.service';

import { buildCameraFixture } from '../testing/camera.entity.fixture';

import { CameraRepository } from './camera.repository';

describe('CameraRepository', () => {
  let repo: CameraRepository;
  let camera: {
    create: jest.Mock;
    update: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    count: jest.Mock;
  };
  let aerodrome: { findFirst: jest.Mock };

  beforeEach(() => {
    camera = {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    };
    aerodrome = { findFirst: jest.fn() };
    repo = new CameraRepository({
      camera,
      aerodrome,
    } as unknown as PrismaService);
  });

  it('findById filtra deletedAt: null', async () => {
    camera.findFirst.mockResolvedValue(null);
    await repo.findById('id-1');
    expect(camera.findFirst).toHaveBeenCalledWith({
      where: { id: 'id-1', deletedAt: null },
    });
  });

  it('findMany aplica activeWhere + orderBy icao,name,id', async () => {
    camera.findMany.mockResolvedValue([]);
    await repo.findMany(
      { icao: { equals: 'SBXX', mode: 'insensitive' } },
      10,
      5,
    );
    expect(camera.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          { icao: { equals: 'SBXX', mode: 'insensitive' } },
          { deletedAt: null },
        ],
      },
      skip: 10,
      take: 5,
      orderBy: [{ icao: 'asc' }, { name: 'asc' }, { id: 'asc' }],
    });
  });

  it('count aplica activeWhere', async () => {
    camera.count.mockResolvedValue(0);
    await repo.count({});
    expect(camera.count).toHaveBeenCalledWith({
      where: { AND: [{}, { deletedAt: null }] },
    });
  });

  it('softDelete seta deletedAt/deletedBy/updatedBy + enabled=false, where ativo', async () => {
    camera.update.mockResolvedValue(buildCameraFixture());
    await repo.softDelete('id-1', 'u9');
    const [[arg]] = camera.update.mock.calls as Array<
      [{ where: unknown; data: Record<string, unknown> }]
    >;
    expect(arg.where).toEqual({ id: 'id-1', deletedAt: null });
    expect(arg.data.deletedBy).toBe('u9');
    expect(arg.data.updatedBy).toBe('u9');
    expect(arg.data.enabled).toBe(false);
    expect(arg.data.deletedAt).toBeInstanceOf(Date);
  });

  it('findActiveStreamConflict monta where do trio + exceptId', async () => {
    camera.findFirst.mockResolvedValue(null);
    await repo.findActiveStreamConflict({
      icao: 'SBXX',
      mediamtxNode: 'n',
      mediamtxPath: 'p',
      exceptId: 'self',
    });
    expect(camera.findFirst).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        icao: 'SBXX',
        mediamtxNode: 'n',
        mediamtxPath: 'p',
        id: { not: 'self' },
      },
      select: { id: true },
    });
  });

  it('findActiveStreamConflict sem exceptId omite o id', async () => {
    camera.findFirst.mockResolvedValue(null);
    await repo.findActiveStreamConflict({
      icao: 'SBXX',
      mediamtxNode: 'n',
      mediamtxPath: 'p',
    });
    expect(camera.findFirst).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        icao: 'SBXX',
        mediamtxNode: 'n',
        mediamtxPath: 'p',
      },
      select: { id: true },
    });
  });

  it('findActiveAerodrome seleciona id/groupId/icao ativos', async () => {
    aerodrome.findFirst.mockResolvedValue({
      id: 'aid',
      groupId: 'g',
      icao: 'SBXX',
    });
    const out = await repo.findActiveAerodrome('aid');
    expect(aerodrome.findFirst).toHaveBeenCalledWith({
      where: { id: 'aid', deletedAt: null },
      select: { id: true, groupId: true, icao: true },
    });
    expect(out).toEqual({ id: 'aid', groupId: 'g', icao: 'SBXX' });
  });
});
