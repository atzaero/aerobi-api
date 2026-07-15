import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { AerodromeRepository } from '../repositories/aerodrome.repository';
import { buildAerodromeWithGroupFixture } from '../testing/aerodrome.entity.fixture';

import { ExportAerodromesService } from './export-aerodromes.service';

const HEADER =
  '\uFEFFICAO,Nome,Município,UF,Grupo,Aberto,Visível,Meteorologia,Balizado,' +
  'Abastecimento,Criado em (UTC)';

const admin: AuthenticatedUser = {
  id: 'admin-1',
  email: 'a@e',
  role: UserRole.ADMIN,
};
const operator: AuthenticatedUser = {
  id: 'op-1',
  email: 'o@e',
  role: UserRole.OPERATOR,
};

describe('ExportAerodromesService', () => {
  let service: ExportAerodromesService;
  let findMany: jest.Mock;
  let count: jest.Mock;
  let findActiveById: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn();
    count = jest.fn();
    findActiveById = jest.fn();
    const repo = { findMany, count } as unknown as AerodromeRepository;
    const userRepo = { findActiveById } as unknown as UserRepository;
    service = new ExportAerodromesService(
      repo,
      userRepo,
      new ErrorMessageService(),
    );
  });

  it('ADMIN: where vazio, busca MAX+1 sem paginação, cabeçalho + linha', async () => {
    findMany.mockResolvedValue([
      buildAerodromeWithGroupFixture({ icao: 'SBSP', name: 'Congonhas' }),
    ]);
    const { csv, truncated } = await service.execute({}, admin);
    expect(findMany).toHaveBeenCalledWith({}, 0, 50_001);
    expect(csv.startsWith(HEADER)).toBe(true);
    expect(csv).toContain('\r\n');
    expect(csv).toContain('SBSP');
    expect(truncated).toBe(false);
    expect(count).not.toHaveBeenCalled();
    expect(findActiveById).not.toHaveBeenCalled();
  });

  it('filtra por search (OR icao/name/municipality)', async () => {
    findMany.mockResolvedValue([]);
    await service.execute({ search: 'sb' }, admin);
    expect(findMany).toHaveBeenCalledWith(
      {
        OR: [
          { icao: { contains: 'sb', mode: 'insensitive' } },
          { name: { contains: 'sb', mode: 'insensitive' } },
          { municipality: { contains: 'sb', mode: 'insensitive' } },
        ],
      },
      0,
      50_001,
    );
  });

  it('OPERATOR com grupo: força where.groupId (escopo operacional)', async () => {
    findActiveById.mockResolvedValue({ groupId: 'g9' });
    findMany.mockResolvedValue([]);
    await service.execute({ groupId: 'other' }, operator);
    expect(findMany).toHaveBeenCalledWith({ groupId: 'g9' }, 0, 50_001);
  });

  it('papel restrito sem grupo: where fail-closed, CSV só cabeçalho', async () => {
    findActiveById.mockResolvedValue({ groupId: null });
    findMany.mockResolvedValue([]);
    const { csv } = await service.execute({}, operator);
    expect(csv).toBe(HEADER);
    expect(findMany).toHaveBeenCalledWith({ id: { in: [] } }, 0, 50_001);
  });

  it('ator inativo (registro null): 401, sem tocar no repo', async () => {
    findActiveById.mockResolvedValue(null);
    await expect(service.execute({}, operator)).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(findMany).not.toHaveBeenCalled();
  });

  it('booleanos como Sim/Não e UF derivada do grupo na linha', async () => {
    findMany.mockResolvedValue([
      buildAerodromeWithGroupFixture({
        icao: 'SBSP',
        isOpen: true,
        lit: false,
        fueling: null,
      }),
    ]);
    const { csv } = await service.execute({}, admin);
    const dataRow = csv.split('\r\n')[1];
    expect(dataRow).toContain(',PI,');
    expect(dataRow).toContain('Sim');
    expect(dataRow).toContain('Não');
  });

  it('trunca em EXPORT_MAX_ROWS e sinaliza truncated + total real', async () => {
    const warn = jest.spyOn(service['logger'], 'warn').mockImplementation();
    const one = buildAerodromeWithGroupFixture();
    findMany.mockResolvedValue(Array.from({ length: 50_001 }, () => one));
    count.mockResolvedValue(73_000);
    const { csv, truncated, total } = await service.execute({}, admin);
    expect(csv.split('\r\n')).toHaveLength(1 + 50_000);
    expect(truncated).toBe(true);
    expect(total).toBe(73_000);
    expect(count).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalled();
  });

  it('count do total falha → CSV truncado com total = EXPORT_MAX_ROWS (best-effort)', async () => {
    jest.spyOn(service['logger'], 'warn').mockImplementation();
    const one = buildAerodromeWithGroupFixture();
    findMany.mockResolvedValue(Array.from({ length: 50_001 }, () => one));
    count.mockRejectedValue(new Error('statement timeout'));
    const { truncated, total } = await service.execute({}, admin);
    expect(truncated).toBe(true);
    expect(total).toBe(50_000);
  });
});
