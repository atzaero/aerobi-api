import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ListTaskGuessesQueryDTO } from './list-task-guesses-query.dto';

async function invalidProps(raw: Record<string, unknown>): Promise<string[]> {
  const dto = plainToInstance(ListTaskGuessesQueryDTO, raw);
  const errors = await validate(dto);
  return errors.map((error) => error.property);
}

describe('ListTaskGuessesQueryDTO', () => {
  it('aceita filtros válidos', async () => {
    const props = await invalidProps({
      status: 'considered',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });
    expect(props).toHaveLength(0);
  });

  it('aceita query vazia (todos os campos são opcionais)', async () => {
    expect(await invalidProps({})).toHaveLength(0);
  });

  it('rejeita data malformada em startDate', async () => {
    expect(await invalidProps({ startDate: '2026/01/01' })).toContain(
      'startDate',
    );
    expect(await invalidProps({ startDate: 'garbage' })).toContain('startDate');
  });

  it('rejeita endDate anterior a startDate', async () => {
    expect(
      await invalidProps({ startDate: '2026-06-01', endDate: '2026-05-01' }),
    ).toContain('endDate');
  });

  it('rejeita status fora do conjunto permitido', async () => {
    expect(await invalidProps({ status: 'invalid' })).toContain('status');
  });
});
