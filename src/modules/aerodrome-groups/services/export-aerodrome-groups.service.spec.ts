import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { CustomHttpException } from '@/common/exceptions/custom-http.exception';
import { Uf, UserRole } from '@/generated/prisma/client';
import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import type { UserRepository } from '@/modules/users/repositories/user.repository';

import type { AerodromeGroupRepository } from '../repositories/aerodrome-group.repository';
import { buildAerodromeGroupFixture } from '../testing/aerodrome-group.entity.fixture';

import { ExportAerodromeGroupsService } from './export-aerodrome-groups.service';

const HEADER =
  '\uFEFFID,Nome,UF,Proprietário,Pedido de exclusão,Criado em (UTC),' +
  'Criado por,Atualizado em (UTC),Atualizado por,Removido em (UTC),Removido por';

const admin: AuthenticatedUser = {
  id: 'admin-1',
  email: 'a@e',
  role: UserRole.ADMIN,
};
const coordinator: AuthenticatedUser = {
  id: 'coord-1',
  email: 'c@e',
  role: UserRole.COORDINATOR,
};

describe('ExportAerodromeGroupsService', () => {
  let service: ExportAerodromeGroupsService;
  let findMany: jest.Mock;
  let count: jest.Mock;
  let findActiveById: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn();
    count = jest.fn();
    findActiveById = jest.fn();
    const repo = { findMany, count } as unknown as AerodromeGroupRepository;
    const userRepo = { findActiveById } as unknown as UserRepository;
    service = new ExportAerodromeGroupsService(
      repo,
      userRepo,
      new ErrorMessageService(),
    );
  });

  it('ADMIN: where vazio, busca MAX+1 sem paginação, cabeçalho + linha', async () => {
    findMany.mockResolvedValue([
      buildAerodromeGroupFixture({ name: 'Interior', uf: Uf.SP }),
    ]);
    const { csv, truncated } = await service.execute({}, admin);
    expect(findMany).toHaveBeenCalledWith({}, 0, 50_001);
    expect(csv.startsWith(HEADER)).toBe(true);
    expect(csv).toContain('\r\n');
    expect(csv).toContain('Interior');
    expect(truncated).toBe(false);
    expect(count).not.toHaveBeenCalled();
    expect(findActiveById).not.toHaveBeenCalled();
  });

  it('filtra por uf + name (substring case-insensitive)', async () => {
    findMany.mockResolvedValue([]);
    await service.execute({ uf: Uf.SP, name: 'int' }, admin);
    expect(findMany).toHaveBeenCalledWith(
      { uf: Uf.SP, name: { contains: 'int', mode: 'insensitive' } },
      0,
      50_001,
    );
  });

  it('COORDINATOR com grupo: força where.id', async () => {
    findActiveById.mockResolvedValue({ aerodromeGroupId: 'g9' });
    findMany.mockResolvedValue([]);
    await service.execute({}, coordinator);
    expect(findMany).toHaveBeenCalledWith({ id: 'g9' }, 0, 50_001);
  });

  it('COORDINATOR com grupo + filtros: where combina uf, name e id', async () => {
    findActiveById.mockResolvedValue({ aerodromeGroupId: 'g9' });
    findMany.mockResolvedValue([]);
    await service.execute({ uf: Uf.SP, name: 'int' }, coordinator);
    expect(findMany).toHaveBeenCalledWith(
      { uf: Uf.SP, name: { contains: 'int', mode: 'insensitive' }, id: 'g9' },
      0,
      50_001,
    );
  });

  it('COORDINATOR sem grupo: where fail-closed (id in []), CSV só cabeçalho', async () => {
    findActiveById.mockResolvedValue({ aerodromeGroupId: null });
    findMany.mockResolvedValue([]);
    const { csv } = await service.execute({}, coordinator);
    expect(csv).toBe(HEADER);
    /** Mesmo invariante da listagem: `none` cai no `where` que nunca casa, em
     * vez de short-circuit por serviço (#383). */
    expect(findMany).toHaveBeenCalledWith({ id: { in: [] } }, 0, 50_001);
  });

  it('COORDINATOR inativo/soft-deletado (registro null): 401, sem tocar no repo', async () => {
    findActiveById.mockResolvedValue(null);
    await expect(service.execute({}, coordinator)).rejects.toBeInstanceOf(
      CustomHttpException,
    );
    expect(findMany).not.toHaveBeenCalled();
  });

  it('campos nulos viram célula vazia na linha CSV', async () => {
    findMany.mockResolvedValue([
      buildAerodromeGroupFixture({
        name: 'G',
        ownerId: null,
        createdBy: null,
        updatedBy: null,
      }),
    ]);
    const { csv } = await service.execute({}, admin);
    const dataRow = csv.split('\r\n')[1];
    /** ...,Proprietário(vazio),... e ...,Criado por(vazio),... */
    expect(dataRow).toContain(',,');
  });

  it('trunca em EXPORT_MAX_ROWS e sinaliza truncated + total real (#392)', async () => {
    const warn = jest.spyOn(service['logger'], 'warn').mockImplementation();
    const one = buildAerodromeGroupFixture();
    findMany.mockResolvedValue(Array.from({ length: 50_001 }, () => one));
    count.mockResolvedValue(73_000);
    const { csv, truncated, total } = await service.execute({}, admin);
    /** Cabeçalho + 50.000 linhas de dados (a 50.001ª é descartada). */
    expect(csv.split('\r\n')).toHaveLength(1 + 50_000);
    expect(truncated).toBe(true);
    /** O `total` real vem de um `count(where)`, não do array materializado. */
    expect(total).toBe(73_000);
    expect(count).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('count do total falha → ainda entrega o CSV truncado com total = EXPORT_MAX_ROWS (best-effort, sem 500)', async () => {
    jest.spyOn(service['logger'], 'warn').mockImplementation();
    const one = buildAerodromeGroupFixture();
    findMany.mockResolvedValue(Array.from({ length: 50_001 }, () => one));
    count.mockRejectedValue(new Error('statement timeout'));
    const { csv, truncated, total } = await service.execute({}, admin);
    expect(truncated).toBe(true);
    expect(total).toBe(50_000);
    expect(csv.split('\r\n')).toHaveLength(1 + 50_000);
  });

  it('total nunca menor que o entregue: count abaixo do teto (soft-delete concorrente) é clampado', async () => {
    jest.spyOn(service['logger'], 'warn').mockImplementation();
    const one = buildAerodromeGroupFixture();
    findMany.mockResolvedValue(Array.from({ length: 50_001 }, () => one));
    count.mockResolvedValue(40_000);
    const { truncated, total } = await service.execute({}, admin);
    expect(truncated).toBe(true);
    expect(total).toBe(50_000);
  });
});
