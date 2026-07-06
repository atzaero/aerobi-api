import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateTaskDTO } from './task.dto';

/**
 * Payload cru válido para POST /tasks; cada teste sobrescreve o campo em foco.
 */
function rawCreate(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    maintenanceId: '11111111-1111-4111-8111-111111111111',
    title: 'Trocar lâmpadas',
    description: 'Substituir lâmpadas do pátio',
    predictedValue: 1000,
    insertionDate: '2026-01-01T00:00:00.000Z',
    predictedDate: '2026-02-01T00:00:00.000Z',
    ...overrides,
  };
}

async function validateCreate(
  overrides: Record<string, unknown>,
): Promise<{ dto: CreateTaskDTO; properties: string[] }> {
  const dto = plainToInstance(CreateTaskDTO, rawCreate(overrides));
  const errors = await validate(dto);
  return { dto, properties: errors.map((error) => error.property) };
}

describe('CreateTaskDTO', () => {
  it('rejeita title só com whitespace (trim antes de @IsNotEmpty)', async () => {
    const { properties } = await validateCreate({ title: '   ' });
    expect(properties).toContain('title');
  });

  it('rejeita description só com whitespace', async () => {
    const { properties } = await validateCreate({ description: '\t \n' });
    expect(properties).toContain('description');
  });

  it('aceita e trima title/description com conteúdo', async () => {
    const { dto, properties } = await validateCreate({
      title: '  Título  ',
      description: '  Descrição  ',
    });
    expect(properties).toHaveLength(0);
    expect(dto.title).toBe('Título');
    expect(dto.description).toBe('Descrição');
  });

  it('preserva undefined em opcionais ausentes (não vira string vazia)', async () => {
    const { dto } = await validateCreate({});
    expect(dto.responsibility).toBeUndefined();
    expect(dto.impact).toBeUndefined();
    expect(dto.completionDescription).toBeUndefined();
    expect(dto.timeElapsed).toBeUndefined();
  });
});
