import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { SyncRabDto } from './sync-rab.dto';

function validate(payload: Record<string, unknown>) {
  return validateSync(plainToInstance(SyncRabDto, payload), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

describe('SyncRabDto', () => {
  it('aceita corpo vazio (todos os campos opcionais)', () => {
    expect(validate({})).toHaveLength(0);
  });

  it('aceita period no formato YYYY-MM e force boolean', () => {
    expect(validate({ period: '2026-03', force: true })).toHaveLength(0);
  });

  it.each(['2026-3', '2026/03', 'março', '20260-3'])(
    'rejeita period fora do formato YYYY-MM (%s)',
    (period) => {
      const errors = validate({ period });
      expect(errors).not.toHaveLength(0);
      expect(errors[0].property).toBe('period');
    },
  );

  it('rejeita force não-booleano', () => {
    const errors = validate({ force: 'yes' });
    expect(errors).not.toHaveLength(0);
    expect(errors[0].property).toBe('force');
  });
});
