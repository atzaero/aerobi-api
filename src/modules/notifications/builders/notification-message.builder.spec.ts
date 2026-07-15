import { MovementType } from '@/generated/prisma/enums';

import { MovementCreatedMessageBuilder } from './movement-created.builder';
import { MovementsBatchSummaryMessageBuilder } from './movements-batch-summary.builder';

describe('MovementCreatedMessageBuilder', () => {
  const builder = new MovementCreatedMessageBuilder();

  it('renderiza aeronave, aeródromo, operação e data (fuso de SP)', () => {
    const text = builder.build({
      registration: 'PRZTT',
      aerodrome: 'SSCF',
      operationType: MovementType.LANDING,
      readingDatetime: '2026-06-08T16:52:39Z',
    });

    expect(text).toContain('PRZTT');
    expect(text).toContain('SSCF');
    expect(text).toContain('pouso');
    expect(text).toContain('08/06/2026 13:52');
  });

  it('traduz TAKEOFF para decolagem', () => {
    const text = builder.build({
      registration: 'PRZTT',
      aerodrome: 'SSCF',
      operationType: MovementType.TAKEOFF,
      readingDatetime: '2026-06-08T16:52:39Z',
    });
    expect(text).toContain('decolagem');
  });

  it('usa fallbacks quando faltam campos', () => {
    const text = builder.build({});
    expect(text).toContain('aeronave');
    expect(text).toContain('aeródromo não informado');
  });
});

describe('MovementsBatchSummaryMessageBuilder', () => {
  const builder = new MovementsBatchSummaryMessageBuilder();

  it('monta cabeçalho com grupo e contagem + linhas por item', () => {
    const text = builder.build({
      groupName: 'Grupo SP',
      count: 2,
      items: [
        {
          registration: 'PRZTT',
          aerodrome: 'SSCF',
          operationType: MovementType.LANDING,
        },
        {
          registration: 'PSABC',
          aerodrome: 'SBSP',
          operationType: MovementType.TAKEOFF,
        },
      ],
    });

    expect(text).toContain('2 movimento(s)');
    expect(text).toContain('Grupo SP');
    expect(text).toContain('• PRZTT — pouso em SSCF');
    expect(text).toContain('• PSABC — decolagem em SBSP');
  });

  it('lista no máximo 10 itens e resume o excedente', () => {
    const items = Array.from({ length: 12 }, (_, i) => ({
      registration: `PR-${i}`,
      aerodrome: 'SSCF',
      operationType: MovementType.LANDING,
    }));

    const text = builder.build({ items });

    expect(text).toContain('12 movimento(s)');
    expect(text).toContain('…e mais 2');
    expect(text.split('\n').filter((l) => l.startsWith('•'))).toHaveLength(10);
  });
});
