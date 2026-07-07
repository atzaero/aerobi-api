import type { MaintenanceTask } from '@/generated/prisma/client';

import { MaintenanceTaskMapper } from './maintenance-task.mapper';

const TASK_ID = '11111111-1111-4111-8111-111111111111';

/**
 * MaintenanceTask completo para o mapper de resposta. `predictedValue`/
 * `actualCost` expõem só o `toNumber()` do Decimal do Prisma.
 */
function entity(
  overrides: Partial<Record<string, unknown>> = {},
): MaintenanceTask {
  return {
    id: TASK_ID,
    maintenanceId: 'maint-1',
    title: 'Trocar lâmpadas',
    description: 'Substituir lâmpadas do pátio',
    predictedValue: { toNumber: () => 1500.5 },
    insertionDate: new Date('2026-01-02T03:04:05.000Z'),
    predictedDate: new Date('2026-02-10T00:00:00.000Z'),
    completionDate: null,
    actualCost: null,
    completionDescription: null,
    impact: null,
    timeElapsed: null,
    status: 'PENDING',
    urgency: null,
    followUp: null,
    investmentType: null,
    responsibility: null,
    delayWarning: false,
    createdAt: new Date('2026-01-01T10:00:00.000Z'),
    updatedAt: new Date('2026-01-05T12:00:00.000Z'),
    ...overrides,
  } as unknown as MaintenanceTask;
}

describe('MaintenanceTaskMapper.toApiRow', () => {
  it('serializa datas em ISO 8601 (incluindo completionDate quando presente)', () => {
    const row = MaintenanceTaskMapper.toApiRow(
      entity({ completionDate: new Date('2026-03-01T00:00:00.000Z') }),
    );

    expect(row.insertionDate).toBe('2026-01-02T03:04:05.000Z');
    expect(row.predictedDate).toBe('2026-02-10T00:00:00.000Z');
    expect(row.completionDate).toBe('2026-03-01T00:00:00.000Z');
    expect(row.createdAt).toBe('2026-01-01T10:00:00.000Z');
    expect(row.updatedAt).toBe('2026-01-05T12:00:00.000Z');
  });

  it('completionDate ausente vira null', () => {
    const row = MaintenanceTaskMapper.toApiRow(
      entity({ completionDate: null }),
    );
    expect(row.completionDate).toBeNull();
  });

  it('converte enums Prisma para o vocabulário lowercase da API', () => {
    const row = MaintenanceTaskMapper.toApiRow(
      entity({
        status: 'COMPLETED',
        urgency: 'HIGH',
        followUp: 'IN_PROGRESS',
        investmentType: 'CAPEX',
      }),
    );

    expect(row.status).toBe('completed');
    expect(row.urgency).toBe('high');
    expect(row.followUp).toBe('in_progress');
    expect(row.investmentType).toBe('CAPEX');
  });

  it('enums opcionais nulos permanecem null', () => {
    const row = MaintenanceTaskMapper.toApiRow(entity());
    expect(row.urgency).toBeNull();
    expect(row.followUp).toBeNull();
    expect(row.investmentType).toBeNull();
  });

  it('projeta Decimal em número e trata predictedValue nulo como 0', () => {
    const row = MaintenanceTaskMapper.toApiRow(
      entity({
        predictedValue: null,
        actualCost: { toNumber: () => 42.75 },
      }),
    );

    expect(row.predictedValue).toBe(0);
    expect(row.actualCost).toBe(42.75);
  });

  it('inclui suggestionCount quando informado', () => {
    const row = MaintenanceTaskMapper.toApiRow(entity(), 7);
    expect(row.suggestionCount).toBe(7);
  });

  it('inclui suggestionCount quando informado como 0 (distingue de ausente)', () => {
    const row = MaintenanceTaskMapper.toApiRow(entity(), 0);
    expect(row.suggestionCount).toBe(0);
  });

  it('OMITE suggestionCount quando não informado (undefined → some do JSON)', () => {
    const row = MaintenanceTaskMapper.toApiRow(entity());
    expect(row.suggestionCount).toBeUndefined();
    expect(JSON.parse(JSON.stringify(row))).not.toHaveProperty(
      'suggestionCount',
    );
  });
});

describe('MaintenanceTaskMapper.toApiRows', () => {
  it('mapeia a coleção e resolve suggestionCount por id no Map', () => {
    const rows = MaintenanceTaskMapper.toApiRows(
      [entity({ id: 'a' }), entity({ id: 'b' })],
      new Map([
        ['a', 2],
        ['b', 5],
      ]),
    );

    expect(rows.map((r) => r.suggestionCount)).toEqual([2, 5]);
  });

  it('sem Map de contagens, nenhuma linha recebe suggestionCount', () => {
    const rows = MaintenanceTaskMapper.toApiRows([entity({ id: 'a' })]);
    expect(rows[0].suggestionCount).toBeUndefined();
  });
});
