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
  let findActiveById: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn();
    findActiveById = jest.fn();
    const repo = { findMany } as unknown as AerodromeGroupRepository;
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
    const csv = await service.execute({}, admin);
    expect(findMany).toHaveBeenCalledWith({}, 0, 50_001);
    expect(csv.startsWith(HEADER)).toBe(true);
    expect(csv).toContain('\r\n');
    expect(csv).toContain('Interior');
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
    const csv = await service.execute({}, coordinator);
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
    const csv = await service.execute({}, admin);
    const dataRow = csv.split('\r\n')[1];
    // ...,Proprietário(vazio),... e ...,Criado por(vazio),...
    expect(dataRow).toContain(',,');
  });

  it('trunca em EXPORT_MAX_ROWS quando o resultado excede (e loga)', async () => {
    const warn = jest.spyOn(service['logger'], 'warn').mockImplementation();
    const one = buildAerodromeGroupFixture();
    findMany.mockResolvedValue(Array.from({ length: 50_001 }, () => one));
    const csv = await service.execute({}, admin);
    // cabeçalho + 50.000 linhas de dados (a 50.001ª é descartada).
    expect(csv.split('\r\n')).toHaveLength(1 + 50_000);
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
