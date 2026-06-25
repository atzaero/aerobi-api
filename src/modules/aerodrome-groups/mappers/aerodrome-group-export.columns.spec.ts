import { Uf } from '@/generated/prisma/client';

import { buildAerodromeGroupFixture } from '../testing/aerodrome-group.entity.fixture';

import { aerodromeGroupExportColumns } from './aerodrome-group-export.columns';

describe('aerodromeGroupExportColumns', () => {
  it('expõe as 11 colunas da tabela, na ordem', () => {
    expect(aerodromeGroupExportColumns.map((c) => c.header)).toEqual([
      'ID',
      'Nome',
      'UF',
      'Proprietário',
      'Pedido de exclusão',
      'Criado em (UTC)',
      'Criado por',
      'Atualizado em (UTC)',
      'Atualizado por',
      'Removido em (UTC)',
      'Removido por',
    ]);
  });

  it('formata valores: ISO em datas, Sim/Não em booleano, null → vazio', () => {
    const group = buildAerodromeGroupFixture({
      id: 'gid',
      name: 'Interior',
      uf: Uf.SP,
      ownerId: null,
      deletionRequested: true,
      createdBy: 'admin',
      deletedAt: null,
    });
    const values = aerodromeGroupExportColumns.map((c) => c.accessor(group));
    expect(values[0]).toBe('gid');
    expect(values[1]).toBe('Interior');
    expect(values[2]).toBe(Uf.SP);
    expect(values[3]).toBeNull();
    expect(values[4]).toBe('Sim');
    expect(values[5]).toBe(group.createdAt.toISOString());
    expect(values[6]).toBe('admin');
    expect(values[9]).toBe('');
  });

  it('deletionRequested: false → Não, null → vazio', () => {
    const reqColumn = aerodromeGroupExportColumns[4];
    expect(
      reqColumn.accessor(
        buildAerodromeGroupFixture({ deletionRequested: false }),
      ),
    ).toBe('Não');
    expect(
      reqColumn.accessor(
        buildAerodromeGroupFixture({ deletionRequested: null }),
      ),
    ).toBe('');
  });
});
