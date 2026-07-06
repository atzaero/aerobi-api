import { CreateTaskDTO } from '../dtos/task.dto';

import {
  buildTaskCreateInput,
  buildTaskUpdateInput,
} from './maintenance-task.prisma.mapper';

/**
 * DTO de tarefa mínimo válido; cada teste sobrescreve só os campos relevantes.
 */
function baseDto(overrides: Partial<CreateTaskDTO> = {}): CreateTaskDTO {
  return {
    title: 'Trocar lâmpadas',
    description: 'Substituir lâmpadas do pátio',
    predictedValue: 1000,
    insertionDate: '2026-01-01T00:00:00.000Z',
    predictedDate: '2026-02-01T00:00:00.000Z',
    ...overrides,
  } as CreateTaskDTO;
}

describe('buildTaskScalarFields (via buildTaskCreateInput/buildTaskUpdateInput)', () => {
  const ctx = { maintenanceId: 'maintenance-1', actorId: 'actor-1' };

  describe('normalização de strings opcionais (empty/whitespace → null)', () => {
    it('converte string vazia e whitespace em null', () => {
      const input = buildTaskCreateInput({
        dto: baseDto({
          responsibility: '',
          impact: '   ',
          completionDescription: '',
          timeElapsed: '\t \n',
        }),
        ...ctx,
      });

      expect(input.responsibility).toBeNull();
      expect(input.impact).toBeNull();
      expect(input.completionDescription).toBeNull();
      expect(input.timeElapsed).toBeNull();
    });

    it('converte campos opcionais ausentes (undefined) em null', () => {
      const input = buildTaskCreateInput({ dto: baseDto(), ...ctx });

      expect(input.responsibility).toBeNull();
      expect(input.impact).toBeNull();
      expect(input.completionDescription).toBeNull();
      expect(input.timeElapsed).toBeNull();
    });

    it('trima strings opcionais com conteúdo', () => {
      const input = buildTaskCreateInput({
        dto: baseDto({
          responsibility: '  João Silva  ',
          impact: '  alto  ',
        }),
        ...ctx,
      });

      expect(input.responsibility).toBe('João Silva');
      expect(input.impact).toBe('alto');
    });

    it('aplica a mesma normalização no update', () => {
      const input = buildTaskUpdateInput({
        dto: baseDto({
          impact: '   ',
          responsibility: '  R  ',
        }),
        actorId: 'actor-1',
      });

      expect(input.impact).toBeNull();
      expect(input.responsibility).toBe('R');
    });
  });

  describe('campos obrigatórios de texto', () => {
    it('trima title e description', () => {
      const input = buildTaskCreateInput({
        dto: baseDto({ title: '  Título  ', description: '  Descrição  ' }),
        ...ctx,
      });

      expect(input.title).toBe('Título');
      expect(input.description).toBe('Descrição');
    });
  });

  describe('enums e escalares', () => {
    it('mapeia enums da API (lowercase) para o vocabulário Prisma', () => {
      const input = buildTaskCreateInput({
        dto: baseDto({
          urgency: 'high',
          followUp: 'in_progress',
          investmentType: 'CAPEX',
        }),
        ...ctx,
      });

      expect(input.urgency).toBe('HIGH');
      expect(input.followUp).toBe('IN_PROGRESS');
      expect(input.investmentType).toBe('CAPEX');
    });

    it('usa status pending por padrão e null para opcionais numéricos ausentes', () => {
      const input = buildTaskCreateInput({ dto: baseDto(), ...ctx });

      expect(input.status).toBe('PENDING');
      expect(input.actualCost).toBeNull();
      expect(input.completionDate).toBeNull();
      expect(input.urgency).toBeNull();
      expect(input.followUp).toBeNull();
      expect(input.investmentType).toBeNull();
    });
  });
});
