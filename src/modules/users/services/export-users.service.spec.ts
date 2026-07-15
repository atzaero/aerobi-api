import { ErrorMessageService } from '@/common/error-messages/error-message.service';
import { EXPORT_MAX_ROWS } from '@/common/utils/csv.util';
import { UserRole } from '@/generated/prisma/client';

import type { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';

import type { UserRepository } from '../repositories/user.repository';
import type { UserWithGroupName } from '../repositories/user.repository.interface';
import { buildUserFixture } from '../testing/user.fixtures';

import { ExportUsersService } from './export-users.service';

function rowWithGroup(
  overrides: Partial<UserWithGroupName> = {},
): UserWithGroupName {
  return {
    ...buildUserFixture(),
    group: { name: 'Grupo SP' },
    ...overrides,
  };
}

describe('ExportUsersService', () => {
  let service: ExportUsersService;
  let findActiveById: jest.Mock;
  let findManyForExport: jest.Mock;
  let countForExport: jest.Mock;

  beforeEach(() => {
    findActiveById = jest.fn();
    findManyForExport = jest.fn();
    countForExport = jest.fn();

    const userRepository = {
      findActiveById,
      findManyForExport,
      countForExport,
    } as unknown as UserRepository;

    service = new ExportUsersService(userRepository, new ErrorMessageService());
  });

  it('ADMIN: gera CSV com cabeçalho pt-BR e linha de dados', async () => {
    findManyForExport.mockResolvedValue([
      rowWithGroup({
        name: 'João',
        email: 'joao@x',
        phone: '+5511999999999',
        role: UserRole.OPERATOR,
      }),
    ]);
    const actor: AuthenticatedUser = {
      id: 'admin-1',
      email: 'a@x',
      role: UserRole.ADMIN,
    };

    const { csv, truncated, total } = await service.execute({}, actor);

    expect(findManyForExport).toHaveBeenCalledWith({}, EXPORT_MAX_ROWS + 1);
    expect(csv).toContain(
      'Nome,E-mail,Telefone,Perfil,Grupo,UF,Criado em (UTC)',
    );
    expect(csv).toContain('João');
    expect(csv).toContain('Operador');
    expect(csv).toContain('Grupo SP');
    expect(truncated).toBe(false);
    expect(total).toBe(1);
  });

  it('COORDINATOR: força o groupId do escopo nos filtros', async () => {
    findActiveById.mockResolvedValue(
      buildUserFixture({
        id: 'coord-1',
        role: UserRole.COORDINATOR,
        groupId: 'g1',
      }),
    );
    findManyForExport.mockResolvedValue([]);
    const actor: AuthenticatedUser = {
      id: 'coord-1',
      email: 'c@x',
      role: UserRole.COORDINATOR,
    };

    await service.execute({ groupId: 'outro-grupo' }, actor);

    expect(findManyForExport).toHaveBeenCalledWith(
      expect.objectContaining({ groupId: 'g1' }),
      EXPORT_MAX_ROWS + 1,
    );
  });

  it('COORDINATOR sem grupo (none): CSV só com cabeçalho, total 0', async () => {
    findActiveById.mockResolvedValue(
      buildUserFixture({
        id: 'coord-1',
        role: UserRole.COORDINATOR,
        groupId: null,
      }),
    );
    const actor: AuthenticatedUser = {
      id: 'coord-1',
      email: 'c@x',
      role: UserRole.COORDINATOR,
    };

    const { csv, total } = await service.execute({}, actor);

    expect(findManyForExport).not.toHaveBeenCalled();
    expect(total).toBe(0);
    expect(csv).toContain(
      'Nome,E-mail,Telefone,Perfil,Grupo,UF,Criado em (UTC)',
    );
  });
});
