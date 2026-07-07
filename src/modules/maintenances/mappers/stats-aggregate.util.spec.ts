import { TaskStatus } from '@/generated/prisma/client';

import {
  aggregateMaintenancesDashboard,
  buildInvestmentTypePercent,
  countTasksByAerodrome,
  countTasksByUrgency,
  sumPredictedValue,
  sumPredictedValueByInvestmentType,
  type TaskAggregateRow,
} from './stats-aggregate.util';

/** Instante fixo e data claramente no passado para tornar o atraso determinístico. */
const NOW = Date.parse('2026-06-01T12:00:00.000Z');
const PAST = new Date('2020-01-01T00:00:00.000Z');

/** Fábrica de tarefa agregada com defaults inertes (sem valor, sem urgência). */
function task(over: Partial<TaskAggregateRow>): TaskAggregateRow {
  return {
    maintenanceId: 'm1',
    aerodromeId: 'a1',
    investmentType: null,
    predictedValue: 0,
    status: TaskStatus.PENDING,
    predictedDate: null,
    delayWarning: null,
    urgency: null,
    ...over,
  };
}

describe('sumPredictedValue', () => {
  it('soma valores finitos e ignora não-finitos', () => {
    expect(
      sumPredictedValue([
        task({ predictedValue: 10 }),
        task({ predictedValue: 20 }),
        task({ predictedValue: Number.NaN }),
        task({ predictedValue: Number.POSITIVE_INFINITY }),
      ]),
    ).toBe(30);
  });
});

describe('sumPredictedValueByInvestmentType', () => {
  it('separa CAPEX e OPEX, ignorando não tipados', () => {
    expect(
      sumPredictedValueByInvestmentType([
        task({ investmentType: 'CAPEX', predictedValue: 300 }),
        task({ investmentType: 'OPEX', predictedValue: 100 }),
        task({ investmentType: null, predictedValue: 50 }),
      ]),
    ).toEqual({ capex: 300, opex: 100 });
  });
});

describe('buildInvestmentTypePercent', () => {
  it('divide o total tipado entre CAPEX/OPEX e calcula unknown sobre o total geral', () => {
    expect(
      buildInvestmentTypePercent([
        task({ investmentType: 'CAPEX', predictedValue: 300 }),
        task({ investmentType: 'OPEX', predictedValue: 100 }),
        task({ investmentType: null, predictedValue: 100 }),
      ]),
    ).toEqual({ capex: 75, opex: 25, unknown: 20 });
  });

  it('retorna unknown=100 quando só há valor não tipado', () => {
    expect(
      buildInvestmentTypePercent([
        task({ investmentType: null, predictedValue: 50 }),
      ]),
    ).toEqual({ capex: 0, opex: 0, unknown: 100 });
  });

  it('retorna tudo zero quando não há valores', () => {
    expect(buildInvestmentTypePercent([])).toEqual({
      capex: 0,
      opex: 0,
      unknown: 0,
    });
  });
});

describe('countTasksByUrgency', () => {
  it('conta por urgência em minúsculas e ignora tarefas sem urgência', () => {
    expect(
      countTasksByUrgency([
        task({ urgency: 'HIGH' }),
        task({ urgency: 'HIGH' }),
        task({ urgency: 'LOW' }),
        task({ urgency: null }),
      ]),
    ).toEqual({ high: 2, low: 1 });
  });
});

describe('countTasksByAerodrome', () => {
  it('conta tarefas por aeródromo', () => {
    expect(
      countTasksByAerodrome([
        task({ aerodromeId: 'a1' }),
        task({ aerodromeId: 'a1' }),
        task({ aerodromeId: 'a2' }),
      ]),
    ).toEqual({ a1: 2, a2: 1 });
  });
});

describe('aggregateMaintenancesDashboard', () => {
  it('retorna snapshot zerado quando o escopo é none', () => {
    expect(
      aggregateMaintenancesDashboard({
        scopeKind: 'none',
        aerodromesRegistered: 99,
        maintenances: [{ aerodromeId: 'a1' }],
        tasks: [task({ predictedValue: 500 })],
      }),
    ).toEqual({
      meta: { scopeKind: 'none' },
      aerodromesRegistered: 0,
      aerodromesWithMaintenance: 0,
      investmentTypePercent: { capex: 0, opex: 0, unknown: 0 },
      predictedValueByInvestmentType: { capex: 0, opex: 0 },
      totalPredictedValue: 0,
      overduePending: 0,
      overdueCompleted: 0,
      byUrgency: {},
      tasksByAerodrome: {},
    });
  });

  it('agrega indicadores contando manutenções distintas em atraso', () => {
    const result = aggregateMaintenancesDashboard({
      scopeKind: 'group',
      aerodromesRegistered: 5,
      maintenances: [
        { aerodromeId: 'a1' },
        { aerodromeId: 'a2' },
        { aerodromeId: 'a1' },
      ],
      tasks: [
        task({
          maintenanceId: 'm1',
          aerodromeId: 'a1',
          investmentType: 'CAPEX',
          predictedValue: 300,
          status: TaskStatus.PENDING,
          predictedDate: PAST,
          urgency: 'HIGH',
        }),
        task({
          maintenanceId: 'm1',
          aerodromeId: 'a1',
          investmentType: 'OPEX',
          predictedValue: 100,
          status: TaskStatus.PENDING,
          predictedDate: PAST,
          urgency: 'HIGH',
        }),
        task({
          maintenanceId: 'm2',
          aerodromeId: 'a2',
          investmentType: null,
          predictedValue: 50,
          status: TaskStatus.COMPLETED,
          delayWarning: true,
          urgency: 'LOW',
        }),
        task({
          maintenanceId: 'm3',
          aerodromeId: 'a1',
          investmentType: null,
          predictedValue: 100,
          status: TaskStatus.COMPLETED,
          delayWarning: false,
          urgency: null,
        }),
      ],
      nowMs: NOW,
    });

    expect(result).toEqual({
      meta: { scopeKind: 'group' },
      aerodromesRegistered: 5,
      aerodromesWithMaintenance: 2,
      investmentTypePercent: { capex: 75, opex: 25, unknown: 27 },
      predictedValueByInvestmentType: { capex: 300, opex: 100 },
      totalPredictedValue: 550,
      overduePending: 1,
      overdueCompleted: 1,
      byUrgency: { high: 2, low: 1 },
      tasksByAerodrome: { a1: 3, a2: 1 },
    });
  });
});
